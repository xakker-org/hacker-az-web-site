from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import (
    AttemptStatusChoices,
    Course,
    Enrollment,
    Exam,
    ExamAttempt,
    ExamAttemptAnswer,
    LearningPlan,
    Question,
    QuestionTypeChoices,
)
from .serializers import (
    CabinetSummarySerializer,
    CourseDetailSerializer,
    CourseListSerializer,
    EnrollmentSerializer,
    ExamAttemptSerializer,
    ExamDetailSerializer,
    ExamListSerializer,
    LearningPlanSerializer,
)

class CourseListView(generics.ListAPIView):
    queryset = Course.objects.filter(is_published=True)
    serializer_class = CourseListSerializer

class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.filter(is_published=True).prefetch_related(
        "lessons",
        "exams",
        "learning_plans",
        "learning_plans__learningplancourse_set__course",
    )
    serializer_class = CourseDetailSerializer
    lookup_field = "slug"


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
        questions = Question.objects.select_related("course")
        if enrolled_courses:
            exams = exams.filter(course__in=enrolled_courses)
            questions = questions.filter(course__in=enrolled_courses)

        question_type_breakdown = {
            QuestionTypeChoices.CLOSED: questions.filter(question_type=QuestionTypeChoices.CLOSED).count(),
            QuestionTypeChoices.OPEN: questions.filter(question_type=QuestionTypeChoices.OPEN).count(),
            QuestionTypeChoices.TERMINAL: questions.filter(question_type=QuestionTypeChoices.TERMINAL).count(),
        }
        question_level_breakdown = {
            "beginner": questions.filter(level="beginner").count(),
            "intermediate": questions.filter(level="intermediate").count(),
            "advanced": questions.filter(level="advanced").count(),
        }

        total_lessons = sum(course.lessons.count() for course in enrolled_courses)
        in_progress_courses = sum(1 for course in enrolled_courses if course.exams.exists())

        payload = {
            "username": user.username,
            "email": user.email or "",
            "account_type": "admin" if user.is_staff or user.is_superuser else "client",
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "enrolled_courses": enrolled_courses,
            "plans": plans,
            "exams": exams[:8],
            "stats": {
                "active_courses": len(enrolled_courses),
                "total_lessons": total_lessons,
                "active_plans": plans.count(),
                "available_exams": exams.count(),
                "course_threads": in_progress_courses,
            },
            "question_type_breakdown": question_type_breakdown,
            "question_level_breakdown": question_level_breakdown,
        }
        serializer = self.get_serializer(payload)
        return Response(serializer.data)


class LearningPlanListView(generics.ListAPIView):
    queryset = LearningPlan.objects.filter(is_published=True).prefetch_related(
        "learningplancourse_set__course",
        "learningplancourse_set__course__category",
    )
    serializer_class = LearningPlanSerializer


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

        serializer = self.get_serializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
            return Response(payload, status=status.HTTP_201_CREATED)
        return Response(
            {
                "detail": "User is already enrolled for this course.",
                "enrollment": payload,
            },
            status=status.HTTP_200_OK,
        )