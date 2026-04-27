from decimal import Decimal

from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Activity, UserProfile
from accounts.serializers import ActivitySerializer, UserProfileSerializer

from accounts.models import UserProfile

from .models import (
    AttemptStatusChoices,
    Category,
    Course,
    Enrollment,
    Exam,
    ExamAttempt,
    ExamAttemptAnswer,
    LearningPlan,
    Lesson,
    LessonQuestion,
    LessonQuestionAttempt,
    LessonQuestionChoice,
    Question,
    QuestionAttempt,
    QuestionTypeChoices,
    Room,
    RoomTag,
    Task,
    TaskQuestion,
    UserLessonProgress,
)
from .serializers import (
    CabinetSummarySerializer,
    CategorySerializer,
    CourseDetailSerializer,
    CourseListSerializer,
    EnrollmentSerializer,
    ExamAttemptSerializer,
    ExamDetailSerializer,
    ExamListSerializer,
    LearningPlanSerializer,
    LessonQuestionChoiceFullSerializer,
    LessonQuestionSubmitSerializer,
    LessonSerializer,
    RoomDetailSerializer,
    RoomListSerializer,
    RoomTagSerializer,
    QuestionAnswerSubmitSerializer,
    QuestionAttemptSerializer,
    QuestionDetailSerializer,
    QuestionListSerializer,
    TaskAnswerResultSerializer,
    TaskAnswerSubmitSerializer,
    TaskDetailSerializer,
    UserProgressSerializer,
)
from .services import get_user_question_progress, submit_question_answer, submit_task_answer


# ----- Categories / tags -----

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class RoomTagListView(generics.ListAPIView):
    queryset = RoomTag.objects.all()
    serializer_class = RoomTagSerializer


# ----- Courses (legacy) -----

class CourseListView(generics.ListAPIView):
    queryset = Course.objects.filter(is_published=True).select_related("category").prefetch_related("rooms")
    serializer_class = CourseListSerializer


class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.filter(is_published=True).prefetch_related(
        "lessons",
        "exams",
        "rooms",
        "rooms__tags",
        "learning_plans",
        "learning_plans__learningplancourse_set__course",
    )
    serializer_class = CourseDetailSerializer
    lookup_field = "slug"


# ----- Self-study questions -----

class QuestionListView(generics.ListAPIView):
    serializer_class = QuestionListSerializer

    def get_queryset(self):
        queryset = Question.objects.filter(course__is_published=True).select_related("course", "course__category")
        params = self.request.query_params

        if params.get("level"):
            queryset = queryset.filter(level=params["level"])

        if params.get("question_type"):
            queryset = queryset.filter(question_type=params["question_type"])

        course_filter = params.get("course")
        if course_filter:
            queryset = queryset.filter(Q(course__slug=course_filter) | Q(course_id=course_filter))

        if params.get("search"):
            search = params["search"]
            queryset = queryset.filter(Q(title__icontains=search) | Q(prompt__icontains=search))

        return queryset.order_by("order", "id").distinct()


class QuestionDetailView(generics.RetrieveAPIView):
    serializer_class = QuestionDetailSerializer
    queryset = Question.objects.filter(course__is_published=True).select_related("course", "course__category").prefetch_related("choices")
    lookup_field = "id"

    def retrieve(self, request, *args, **kwargs):
        question = self.get_object()
        data = self.get_serializer(question).data
        if request.user.is_authenticated:
            attempts = QuestionAttempt.objects.filter(user=request.user, question=question).order_by("-attempted_at")
            data["attempts"] = QuestionAttemptSerializer(attempts, many=True).data
            data["has_answered"] = attempts.exists()
            if attempts.exists():
                data["correct_choice_ids"] = list(
                    question.choices.filter(is_correct=True).values_list("id", flat=True)
                )
                data["expected_answer"] = question.expected_answer or ""
            else:
                data["correct_choice_ids"] = []
                data["expected_answer"] = ""
        else:
            data["attempts"] = []
            data["has_answered"] = False
            data["correct_choice_ids"] = []
            data["expected_answer"] = ""
        return Response(data)


class QuestionSubmitAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        question = get_object_or_404(Question.objects.prefetch_related("choices"), id=id)
        serializer = QuestionAnswerSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        if question.question_type == QuestionTypeChoices.CLOSED and payload.get("selected_choice_id") is None:
            return Response({"detail": "Bu sual ucun variant secmelisiniz."}, status=status.HTTP_400_BAD_REQUEST)
        if question.question_type in {QuestionTypeChoices.OPEN, QuestionTypeChoices.TERMINAL} and not (payload.get("answer_text") or "").strip():
            return Response({"detail": "Bu sual ucun yazili cavab daxil etmelisiniz."}, status=status.HTTP_400_BAD_REQUEST)

        result = submit_question_answer(
            user=request.user,
            question=question,
            answer_text=payload.get("answer_text", "") or "",
            selected_choice_id=payload.get("selected_choice_id"),
            selected_choice_ids=payload.get("selected_choice_ids") or [],
            hint_used=payload.get("hint_used", False),
        )

        attempts = QuestionAttempt.objects.filter(user=request.user, question=question).order_by("-attempted_at")
        correct_choice_ids = list(question.choices.filter(is_correct=True).values_list("id", flat=True))
        return Response(
            {
                "question_id": question.id,
                "is_correct": result["is_correct"],
                "points_awarded": result["points_awarded"],
                "attempt_number": result["attempt_number"],
                "explanation": result["explanation"],
                "already_had_correct": result.get("already_had_correct", False),
                "correct_choice_ids": correct_choice_ids,
                "expected_answer": question.expected_answer or "",
                "attempts": QuestionAttemptSerializer(attempts, many=True).data,
            },
            status=status.HTTP_200_OK,
        )


class UserQuestionProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        payload = get_user_question_progress(request.user)
        serializer = UserProgressSerializer(payload)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ----- Rooms -----

class RoomListView(generics.ListAPIView):
    serializer_class = RoomListSerializer

    def get_queryset(self):
        qs = (
            Room.objects.filter(is_published=True)
            .select_related("course", "course__category")
            .prefetch_related("tags", "tasks")
        )
        params = self.request.query_params
        if params.get("level"):
            qs = qs.filter(level=params["level"])
        if params.get("tag"):
            qs = qs.filter(tags__slug=params["tag"])
        if params.get("category"):
            qs = qs.filter(course__category__slug=params["category"])
        if params.get("search"):
            s = params["search"]
            qs = qs.filter(Q(title__icontains=s) | Q(summary__icontains=s) | Q(description__icontains=s))
        return qs.distinct()


class RoomDetailView(generics.RetrieveAPIView):
    serializer_class = RoomDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Room.objects.filter(is_published=True)
            .select_related("course", "course__category")
            .prefetch_related("tags", "tasks__questions__choices")
        )


class TaskDetailView(generics.RetrieveAPIView):
    serializer_class = TaskDetailSerializer

    def get_queryset(self):
        return Task.objects.select_related("room").prefetch_related("questions__choices")

    def get_object(self):
        room_slug = self.kwargs["room_slug"]
        task_slug = self.kwargs["task_slug"]
        return self.get_queryset().get(room__slug=room_slug, slug=task_slug)


class TaskAnswerSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, room_slug, task_slug):
        try:
            task = Task.objects.select_related("room").get(room__slug=room_slug, slug=task_slug)
        except Task.DoesNotExist:
            return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TaskAnswerSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        try:
            question = TaskQuestion.objects.get(id=payload["question_id"], task=task)
        except TaskQuestion.DoesNotExist:
            return Response({"detail": "Question not found for this task."}, status=status.HTTP_404_NOT_FOUND)

        result = submit_task_answer(
            user=request.user,
            task=task,
            question=question,
            submitted_text=payload.get("answer", "") or "",
            selected_choice_id=payload.get("selected_choice"),
            use_hint=payload.get("use_hint", False),
        )
        result_serializer = TaskAnswerResultSerializer(result)
        return Response(result_serializer.data, status=status.HTTP_200_OK)


class TaskHintView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, room_slug, task_slug, question_id):
        try:
            question = TaskQuestion.objects.get(id=question_id, task__room__slug=room_slug, task__slug=task_slug)
        except TaskQuestion.DoesNotExist:
            return Response({"detail": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

        if not question.hint:
            return Response({"detail": "No hint available."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "hint": question.hint,
            "cost": question.hint_cost,
        })


# ----- Plans -----

class LearningPlanListView(generics.ListAPIView):
    queryset = LearningPlan.objects.filter(is_published=True).prefetch_related(
        "learningplancourse_set__course",
        "learningplancourse_set__course__category",
    )
    serializer_class = LearningPlanSerializer


class LearningPlanDetailView(generics.RetrieveAPIView):
    queryset = LearningPlan.objects.filter(is_published=True).prefetch_related(
        "learningplancourse_set__course",
        "learningplancourse_set__course__category",
        "learningplancourse_set__course__rooms",
        "learningplancourse_set__course__rooms__tags",
    )
    serializer_class = LearningPlanSerializer
    lookup_field = "slug"


# ----- Dashboard / cabinet -----

class CabinetView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CabinetSummarySerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()

        enrollments = (
            Enrollment.objects.filter(user=user)
            .select_related("course", "course__category")
            .order_by("-created_at")
        )
        enrolled_courses = [enrollment.course for enrollment in enrollments]

        plans = LearningPlan.objects.filter(is_published=True).prefetch_related(
            "learningplancourse_set__course",
            "learningplancourse_set__course__category",
        )

        exams = (
            Exam.objects.filter(is_published=True)
            .select_related("course", "course__category")
            .prefetch_related("questions")
            .order_by("level", "title")
        )
        if enrolled_courses:
            exams = exams.filter(course__in=enrolled_courses)

        rooms_qs = Room.objects.filter(is_published=True).select_related("course").prefetch_related("tags", "tasks")
        if enrolled_courses:
            active_rooms = rooms_qs.filter(course__in=enrolled_courses)
        else:
            active_rooms = rooms_qs[:6]

        recommended = (
            rooms_qs.exclude(course__in=enrolled_courses)
            .annotate(num_tasks=Count("tasks"))
            .order_by("-num_tasks", "-id")[:6]
        )

        profile, _ = UserProfile.objects.get_or_create(user=user)
        recent_activity = Activity.objects.filter(user=user)[:10]

        stats = {
            "active_courses": len(enrolled_courses),
            "active_plans": plans.count(),
            "available_rooms": active_rooms.count(),
            "available_exams": exams.count(),
            "tasks_completed": profile.tasks_completed,
            "rooms_completed": profile.rooms_completed,
            "xp": profile.xp,
            "rank": profile.rank,
            "streak": profile.streak_days,
        }

        payload = {
            "username": user.username,
            "email": user.email or "",
            "account_type": "admin" if user.is_staff or user.is_superuser else "client",
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "enrolled_courses": enrolled_courses,
            "plans": plans,
            "rooms": active_rooms[:8],
            "recommended_rooms": recommended,
            "exams": exams[:6],
            "profile": UserProfileSerializer(profile).data,
            "recent_activity": ActivitySerializer(recent_activity, many=True).data,
            "stats": stats,
        }
        serializer = self.get_serializer(payload, context={"request": request})
        return Response(serializer.data)


# ----- Legacy exam flow -----

class ExamListView(generics.ListAPIView):
    serializer_class = ExamListSerializer

    def get_queryset(self):
        queryset = Exam.objects.filter(is_published=True).select_related("course", "course__category")
        course_slug = self.request.query_params.get("course")
        if course_slug:
            queryset = queryset.filter(course__slug=course_slug)
        return queryset.prefetch_related("questions")


class ExamDetailView(generics.RetrieveAPIView):
    serializer_class = ExamDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return Exam.objects.filter(is_published=True).select_related("course", "course__category").prefetch_related(
            "examquestion_set__question__choices",
            "examquestion_set__question",
        )


class ExamAttemptCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExamAttemptSerializer

    def get_exam(self):
        return Exam.objects.get(slug=self.kwargs["slug"], is_published=True)

    def create(self, request, *args, **kwargs):
        exam = self.get_exam()
        attempt = (
            ExamAttempt.objects.filter(user=request.user, exam=exam, status=AttemptStatusChoices.IN_PROGRESS)
            .prefetch_related("answers")
            .first()
        )
        if not attempt:
            attempt = ExamAttempt.objects.create(user=request.user, exam=exam)

        serializer = self.get_serializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED if attempt.answers.count() == 0 else status.HTTP_200_OK)


class ExamAttemptSubmitView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExamAttemptSerializer

    def get_exam(self):
        return Exam.objects.get(slug=self.kwargs["slug"], is_published=True)

    def post(self, request, *args, **kwargs):
        exam = self.get_exam()
        attempt_id = request.data.get("attempt")
        attempt = None
        if attempt_id:
            attempt = ExamAttempt.objects.filter(id=attempt_id, user=request.user, exam=exam).first()
        if attempt is None:
            attempt = ExamAttempt.objects.filter(user=request.user, exam=exam, status=AttemptStatusChoices.IN_PROGRESS).first()
        if attempt is None:
            attempt = ExamAttempt.objects.create(user=request.user, exam=exam)

        answers = request.data.get("answers", [])
        question_map = {
            question.id: question
            for question in exam.questions.select_related("course").prefetch_related("choices")
        }
        provided_answers = {answer["question_id"]: answer for answer in answers if answer.get("question_id")}

        with transaction.atomic():
            ExamAttemptAnswer.objects.filter(attempt=attempt).delete()

            graded_points = Decimal("0")
            earned_points = Decimal("0")
            review_pending = False

            for question_id, question in question_map.items():
                answer_data = provided_answers.get(question_id, {})
                selected_choice = answer_data.get("selected_choice")
                text_answer = (answer_data.get("text_answer") or "").strip()

                awarded_points = 0
                is_correct = None
                stored_choice = None

                if question.question_type == QuestionTypeChoices.CLOSED:
                    graded_points += Decimal(question.points)
                    if selected_choice:
                        stored_choice = question.choices.filter(id=selected_choice).first()
                        is_correct = stored_choice is not None and stored_choice.is_correct
                        if is_correct:
                            awarded_points = question.points
                            earned_points += Decimal(question.points)
                else:
                    review_pending = True

                ExamAttemptAnswer.objects.create(
                    attempt=attempt,
                    question=question,
                    selected_choice=stored_choice,
                    text_answer=text_answer,
                    is_correct=is_correct,
                    awarded_points=awarded_points,
                )

            score_percent = Decimal("0")
            if graded_points > 0:
                score_percent = (earned_points / graded_points) * Decimal("100")

            attempt.status = AttemptStatusChoices.SUBMITTED
            attempt.score_percent = score_percent.quantize(Decimal("0.01"))
            attempt.review_pending = review_pending
            attempt.submitted_at = timezone.now()
            attempt.save(update_fields=["status", "score_percent", "review_pending", "submitted_at"])

            Activity.objects.create(
                user=request.user,
                kind=Activity.Kind.EXAM_SUBMIT,
                title=f"Submitted exam: {exam.title}",
                detail=f"Score {attempt.score_percent}%",
                target_slug=exam.slug,
            )

        serializer = self.get_serializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ----- Lesson detail & lesson question submit -----

class LessonDetailView(generics.RetrieveAPIView):
    serializer_class = LessonSerializer

    def get_queryset(self):
        return Lesson.objects.select_related("course").prefetch_related(
            "lesson_questions__choices"
        )

    def get_object(self):
        return get_object_or_404(
            self.get_queryset(),
            id=self.kwargs["lesson_id"],
            course__slug=self.kwargs["slug"],
            course__is_published=True,
        )

    def retrieve(self, request, *args, **kwargs):
        lesson = self.get_object()
        data = self.get_serializer(lesson, context={"request": request}).data
        return Response(data)


class LessonQuestionSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug, lesson_id, question_id):
        lesson = get_object_or_404(
            Lesson, id=lesson_id, course__slug=slug, course__is_published=True
        )
        question = get_object_or_404(
            LessonQuestion.objects.prefetch_related("choices"),
            id=question_id,
            lesson=lesson,
        )

        existing = LessonQuestionAttempt.objects.filter(
            user=request.user, question=question
        ).first()

        correct_ids = list(question.choices.filter(is_correct=True).values_list("id", flat=True))

        if existing:
            return Response({
                "already_answered": True,
                "is_correct": existing.is_correct,
                "points_awarded": existing.points_awarded,
                "correct_choice_ids": correct_ids,
                "explanation": question.explanation or "",
                "selected_choice_id": existing.selected_choice_id,
            }, status=status.HTTP_200_OK)

        serializer = LessonQuestionSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        selected_choice_id = serializer.validated_data["selected_choice_id"]

        choice = get_object_or_404(LessonQuestionChoice, id=selected_choice_id, question=question)
        is_correct = choice.is_correct
        points_awarded = question.points if is_correct else 0

        LessonQuestionAttempt.objects.create(
            user=request.user,
            question=question,
            selected_choice=choice,
            is_correct=is_correct,
            points_awarded=points_awarded,
        )

        if points_awarded > 0:
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            profile.xp = profile.xp + points_awarded
            profile.recompute_rank()
            profile.save()

        # Auto-complete lesson when all questions have been attempted
        total_qs = lesson.lesson_questions.count()
        answered_qs = LessonQuestionAttempt.objects.filter(
            user=request.user, question__lesson=lesson
        ).count()
        lesson_now_complete = total_qs > 0 and answered_qs >= total_qs
        if lesson_now_complete:
            UserLessonProgress.objects.update_or_create(
                user=request.user,
                lesson=lesson,
                defaults={"is_completed": True, "completed_at": timezone.now()},
            )

        return Response({
            "already_answered": False,
            "is_correct": is_correct,
            "points_awarded": points_awarded,
            "correct_choice_ids": correct_ids,
            "explanation": question.explanation or "",
            "selected_choice_id": selected_choice_id,
            "lesson_completed": lesson_now_complete,
        }, status=status.HTTP_200_OK)


class LessonCompleteView(APIView):
    """Explicitly mark a lesson as complete (for lessons with no questions)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug, lesson_id):
        lesson = get_object_or_404(
            Lesson, id=lesson_id, course__slug=slug, course__is_published=True
        )
        progress, created = UserLessonProgress.objects.update_or_create(
            user=request.user,
            lesson=lesson,
            defaults={"is_completed": True, "completed_at": timezone.now()},
        )
        return Response({"lesson_completed": True, "created": created}, status=status.HTTP_200_OK)


class EnrollmentCreateView(generics.CreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user,
            course=serializer.validated_data["course"],
        )
        payload = EnrollmentSerializer(enrollment).data
        if created:
            Activity.objects.create(
                user=request.user,
                kind=Activity.Kind.ENROLL,
                title=f"Enrolled in {enrollment.course.title}",
                detail=enrollment.course.description[:120],
                target_slug=enrollment.course.slug,
            )
            return Response(payload, status=status.HTTP_201_CREATED)
        return Response(
            {
                "detail": "User is already enrolled for this course.",
                "enrollment": payload,
            },
            status=status.HTTP_200_OK,
        )


class RoomEnrollView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        try:
            room = Room.objects.select_related("course").get(slug=slug, is_published=True)
        except Room.DoesNotExist:
            return Response({"detail": "Room not found."}, status=status.HTTP_404_NOT_FOUND)

        enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=room.course)
        if created:
            Activity.objects.create(
                user=request.user,
                kind=Activity.Kind.ENROLL,
                title=f"Joined {room.course.title}",
                detail=f"via room: {room.title}",
                target_slug=room.slug,
            )
        return Response({
            "enrolled": True,
            "room": room.slug,
            "course": room.course.slug,
            "created": created,
        }, status=status.HTTP_200_OK)
