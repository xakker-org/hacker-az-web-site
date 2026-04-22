from rest_framework import serializers
from .models import (
    AttemptStatusChoices,
    Course,
    Exam,
    ExamAttempt,
    ExamAttemptAnswer,
    ExamQuestion,
    Enrollment,
    LearningPlan,
    LearningPlanCourse,
    Lesson,
    Question,
    QuestionChoice,
)

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "order"]


class CourseSummarySerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()

    class Meta:
        model = Course
        fields = ["id", "title", "slug", "description", "category"]


class LearningPlanCourseSerializer(serializers.ModelSerializer):
    course = CourseSummarySerializer(read_only=True)

    class Meta:
        model = LearningPlanCourse
        fields = ["id", "order", "course"]


class LearningPlanSerializer(serializers.ModelSerializer):
    courses = serializers.SerializerMethodField()

    class Meta:
        model = LearningPlan
        fields = ["id", "title", "slug", "summary", "level", "is_featured", "courses"]

    def get_courses(self, obj):
        items = obj.learningplancourse_set.select_related("course", "course__category").order_by("order", "id")
        return LearningPlanCourseSerializer(items, many=True).data


class QuestionChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionChoice
        fields = ["id", "text", "order"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = QuestionChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "title",
            "prompt",
            "question_type",
            "level",
            "points",
            "order",
            "starter_code",
            "explanation",
            "choices",
        ]


class ExamQuestionSerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)

    class Meta:
        model = ExamQuestion
        fields = ["id", "order", "question"]


class ExamListSerializer(serializers.ModelSerializer):
    course = CourseSummarySerializer(read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "instructions",
            "level",
            "time_limit_minutes",
            "course",
            "question_count",
        ]

    def get_question_count(self, obj):
        return obj.questions.count()


class ExamDetailSerializer(serializers.ModelSerializer):
    course = CourseSummarySerializer(read_only=True)
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "instructions",
            "level",
            "time_limit_minutes",
            "course",
            "questions",
        ]

    def get_questions(self, obj):
        items = obj.examquestion_set.select_related("question").prefetch_related("question__choices").order_by("order", "id")
        return ExamQuestionSerializer(items, many=True).data


class ExamAttemptAnswerSerializer(serializers.ModelSerializer):
    question = serializers.PrimaryKeyRelatedField(read_only=True)
    question_id = serializers.PrimaryKeyRelatedField(source="question", queryset=Question.objects.all(), write_only=True)
    selected_choice = serializers.PrimaryKeyRelatedField(queryset=QuestionChoice.objects.all(), allow_null=True, required=False)

    class Meta:
        model = ExamAttemptAnswer
        fields = [
            "id",
            "question",
            "question_id",
            "selected_choice",
            "text_answer",
            "is_correct",
            "awarded_points",
        ]
        read_only_fields = ["is_correct", "awarded_points"]


class ExamAttemptSerializer(serializers.ModelSerializer):
    answers = ExamAttemptAnswerSerializer(many=True, read_only=True)
    exam = ExamListSerializer(read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = ExamAttempt
        fields = [
            "id",
            "exam",
            "status",
            "status_label",
            "score_percent",
            "review_pending",
            "started_at",
            "submitted_at",
            "answers",
        ]


class CabinetSummarySerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.CharField(allow_blank=True)
    account_type = serializers.CharField()
    is_staff = serializers.BooleanField()
    is_superuser = serializers.BooleanField()
    enrolled_courses = CourseSummarySerializer(many=True)
    plans = LearningPlanSerializer(many=True)
    exams = ExamListSerializer(many=True)
    stats = serializers.DictField()
    question_type_breakdown = serializers.DictField()
    question_level_breakdown = serializers.DictField()

class CourseListSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()

    class Meta:
        model = Course
        fields = ["id", "title", "slug", "description", "category"]

class CourseDetailSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    category = serializers.StringRelatedField()
    exams = ExamListSerializer(many=True, read_only=True)
    learning_plans = LearningPlanSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ["id", "title", "slug", "description", "category", "lessons", "exams", "learning_plans"]

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ["id", "user", "course", "created_at"]
        read_only_fields = ["user", "created_at"]