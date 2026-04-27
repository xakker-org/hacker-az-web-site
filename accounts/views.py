from datetime import timedelta

from django.contrib.auth.models import User
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Activity, Badge, UserBadge, UserProfile
from .serializers import (
    ActivitySerializer,
    BadgeSerializer,
    ClientTokenObtainPairSerializer,
    LeaderboardEntrySerializer,
    RegisterSerializer,
    UserBadgeSerializer,
    UserProfileSerializer,
)


class ClientTokenObtainPairView(TokenObtainPairView):
    serializer_class = ClientTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class MeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(
            {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "is_staff": request.user.is_staff,
                "is_superuser": request.user.is_superuser,
                "account_type": "admin" if request.user.is_staff or request.user.is_superuser else "client",
                "profile": UserProfileSerializer(profile).data,
            }
        )


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(UserProfileSerializer(profile).data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PublicProfileView(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username__iexact=username)
        except User.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=404)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        data = UserProfileSerializer(profile).data
        activity = Activity.objects.filter(user=user)[:20]
        data["activity"] = ActivitySerializer(activity, many=True).data
        return Response(data)


class MyActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get("limit", 30))
        activity = Activity.objects.filter(user=request.user)[: max(1, min(limit, 100))]
        return Response(ActivitySerializer(activity, many=True).data)


class LeaderboardView(APIView):
    def get(self, request):
        scope = request.query_params.get("scope", "all")
        qs = UserProfile.objects.filter(user__is_staff=False, user__is_superuser=False).select_related("user")
        qs = qs.order_by("-xp")[:50]
        return Response({
            "scope": scope,
            "entries": LeaderboardEntrySerializer(qs, many=True).data,
        })


class BadgeListView(APIView):
    def get(self, request):
        badges = Badge.objects.all()
        holders_map = {}
        if request.user.is_authenticated:
            holders_map = {
                ub.badge_id: ub
                for ub in UserBadge.objects.filter(user=request.user)
            }
        payload = []
        for badge in badges:
            item = BadgeSerializer(badge).data
            owned = holders_map.get(badge.id)
            item["earned"] = bool(owned)
            item["earned_at"] = owned.earned_at if owned else None
            payload.append(item)
        return Response(payload)


class MyBadgesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = UserBadge.objects.filter(user=request.user).select_related("badge")
        return Response(UserBadgeSerializer(qs, many=True).data)


class ProfileDetailStatsView(APIView):
    """Comprehensive profile stats: XP, rank, self-study questions, accuracy, leaderboard position."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from courses.models import QuestionAttempt

        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        data = UserProfileSerializer(profile).data

        qa_agg = QuestionAttempt.objects.filter(user=user).aggregate(
            total_attempts=Count("id"),
            unique_solved=Count("question", distinct=True),
            correct=Count("id", filter=Q(is_correct=True)),
            points=Sum("points_awarded"),
        )

        unique_correct = (
            QuestionAttempt.objects.filter(user=user, is_correct=True)
            .values("question")
            .distinct()
            .count()
        )

        leaderboard_rank = (
            UserProfile.objects.filter(
                xp__gt=profile.xp,
                user__is_staff=False,
                user__is_superuser=False,
            ).count()
            + 1
        )

        active_days = (
            QuestionAttempt.objects.filter(user=user)
            .annotate(day=TruncDate("attempted_at"))
            .values("day")
            .distinct()
            .count()
        )

        best_day = (
            QuestionAttempt.objects.filter(user=user)
            .annotate(day=TruncDate("attempted_at"))
            .values("day")
            .annotate(day_points=Sum("points_awarded"))
            .order_by("-day_points")
            .first()
        )

        unique_attempted = qa_agg["unique_solved"] or 0
        correct_answers = unique_correct
        wrong_answers = unique_attempted - correct_answers
        accuracy = round(correct_answers / unique_attempted * 100, 1) if unique_attempted > 0 else 0.0

        data.update({
            "leaderboard_rank": leaderboard_rank,
            "total_questions_solved": unique_attempted,
            "total_attempts": qa_agg["total_attempts"] or 0,
            "correct_answers": correct_answers,
            "wrong_answers": max(0, wrong_answers),
            "accuracy_rate": accuracy,
            "total_points_earned": qa_agg["points"] or 0,
            "active_days": active_days,
            "best_day_points": best_day["day_points"] if best_day else 0,
            "best_day_date": str(best_day["day"]) if best_day else None,
        })

        return Response(data)


class ActivityGraphView(APIView):
    """Returns daily activity counts for the last 365 days (contribution graph)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from courses.models import LessonQuestionAttempt, QuestionAttempt, UserQuestionAttempt

        user = request.user
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=364)

        merged = {}

        def add_entries(queryset, points_field):
            for entry in queryset:
                d = str(entry["day"])
                if d not in merged:
                    merged[d] = {"date": d, "questions_solved": 0, "correct_answers": 0, "points_earned": 0}
                merged[d]["questions_solved"] += entry.get("q") or 0
                merged[d]["correct_answers"] += entry.get("c") or 0
                merged[d]["points_earned"] += entry.get(points_field) or 0

        qa_data = (
            QuestionAttempt.objects.filter(user=user, attempted_at__date__gte=start_date)
            .annotate(day=TruncDate("attempted_at"))
            .values("day")
            .annotate(q=Count("id"), c=Count("id", filter=Q(is_correct=True)), p=Sum("points_awarded"))
        )
        add_entries(qa_data, "p")

        lqa_data = (
            LessonQuestionAttempt.objects.filter(user=user, attempted_at__date__gte=start_date)
            .annotate(day=TruncDate("attempted_at"))
            .values("day")
            .annotate(q=Count("id"), c=Count("id", filter=Q(is_correct=True)), p=Sum("points_awarded"))
        )
        add_entries(lqa_data, "p")

        uqa_data = (
            UserQuestionAttempt.objects.filter(user=user, attempted_at__date__gte=start_date)
            .annotate(day=TruncDate("attempted_at"))
            .values("day")
            .annotate(q=Count("id"), c=Count("id", filter=Q(is_correct=True)), p=Sum("awarded_points"))
        )
        add_entries(uqa_data, "p")

        days = []
        current = start_date
        while current <= end_date:
            d = str(current)
            days.append(merged.get(d) or {"date": d, "questions_solved": 0, "correct_answers": 0, "points_earned": 0})
            current += timedelta(days=1)

        return Response({"days": days, "start_date": str(start_date), "end_date": str(end_date)})


class RecentStudyActivityView(APIView):
    """Latest self-study and course quiz activity for the authenticated user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from courses.models import LessonQuestionAttempt, QuestionAttempt

        user = request.user
        limit = min(int(request.query_params.get("limit", 20)), 50)

        activities = []

        qa_list = (
            QuestionAttempt.objects.filter(user=user)
            .select_related("question", "question__course")
            .order_by("-attempted_at")[:limit]
        )
        for qa in qa_list:
            activities.append({
                "id": qa.id,
                "type": "self_study",
                "question_title": qa.question.title,
                "question_id": qa.question.id,
                "course_name": qa.question.course.title if qa.question.course_id else "",
                "is_correct": qa.is_correct,
                "points_earned": qa.points_awarded,
                "attempted_at": qa.attempted_at.isoformat(),
                "attempt_number": qa.attempt_number,
            })

        lqa_list = (
            LessonQuestionAttempt.objects.filter(user=user)
            .select_related("question", "question__lesson", "question__lesson__course")
            .order_by("-attempted_at")[:limit]
        )
        for lqa in lqa_list:
            lesson = lqa.question.lesson
            activities.append({
                "id": f"l{lqa.id}",
                "type": "course",
                "question_title": lqa.question.text[:80],
                "question_id": lqa.question.id,
                "course_name": lesson.course.title if lesson and lesson.course_id else "",
                "is_correct": lqa.is_correct,
                "points_earned": lqa.points_awarded,
                "attempted_at": lqa.attempted_at.isoformat(),
                "attempt_number": 1,
            })

        activities.sort(key=lambda x: x["attempted_at"], reverse=True)
        return Response(activities[:limit])
