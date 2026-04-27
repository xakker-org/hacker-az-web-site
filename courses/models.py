from django.conf import settings
from django.db import models
from django.utils import timezone


class LevelChoices(models.TextChoices):
    BEGINNER = "beginner", "Beginner"
    INTERMEDIATE = "intermediate", "Intermediate"
    ADVANCED = "advanced", "Advanced"


class QuestionTypeChoices(models.TextChoices):
    CLOSED = "closed", "Closed"
    OPEN = "open", "Open"
    TERMINAL = "terminal", "Terminal"


class AttemptStatusChoices(models.TextChoices):
    IN_PROGRESS = "in_progress", "In progress"
    SUBMITTED = "submitted", "Submitted"
    REVIEWED = "reviewed", "Reviewed"


class TaskAnswerKind(models.TextChoices):
    TEXT = "text", "Text match"
    FLAG = "flag", "Flag string"
    CHOICE = "choice", "Multiple choice"
    NUMERIC = "numeric", "Numeric"
    REVIEW = "review", "Manual review"


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    icon = models.CharField(max_length=8, blank=True, default="🛡️")
    color = models.CharField(max_length=16, blank=True, default="#ff5672")
    description = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Course(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    icon = models.CharField(max_length=8, blank=True, default="📘")
    cover_color = models.CharField(max_length=16, blank=True, default="#ff5672")
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class LearningPlan(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    summary = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    icon = models.CharField(max_length=8, blank=True, default="🧭")
    level = models.CharField(max_length=20, choices=LevelChoices.choices, default=LevelChoices.BEGINNER)
    estimated_hours = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    courses = models.ManyToManyField(Course, through="LearningPlanCourse", related_name="learning_plans")

    def __str__(self):
        return self.title


class LearningPlanCourse(models.Model):
    plan = models.ForeignKey(LearningPlan, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order", "id"]
        unique_together = ("plan", "course")

    def __str__(self):
        return f"{self.plan.title} -> {self.course.title}"


class RoomTag(models.Model):
    name = models.CharField(max_length=60)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Room(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="rooms")
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    summary = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    icon = models.CharField(max_length=8, blank=True, default="🧪")
    cover_color = models.CharField(max_length=16, blank=True, default="#ff5672")
    level = models.CharField(max_length=20, choices=LevelChoices.choices, default=LevelChoices.BEGINNER)
    estimated_minutes = models.PositiveIntegerField(default=45)
    points = models.PositiveIntegerField(default=100)
    is_premium = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    tags = models.ManyToManyField(RoomTag, related_name="rooms", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True, default="")
    video_url = models.CharField(max_length=500, blank=True, default="", help_text="YouTube URL or direct video URL")
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class LessonQuestion(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="lesson_questions")
    text = models.TextField(help_text="Question text shown to the student")
    explanation = models.TextField(blank=True, default="", help_text="Shown after answering")
    at_seconds = models.IntegerField(
        null=True, blank=True, default=None,
        help_text="Video timestamp (seconds). Leave blank for inline questions.",
    )
    points = models.PositiveIntegerField(default=10)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"[Lesson {self.lesson_id}] Q{self.order}: {self.text[:60]}"


class LessonQuestionChoice(models.Model):
    question = models.ForeignKey(LessonQuestion, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=400)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{'✓' if self.is_correct else '○'} {self.text[:60]}"


class LessonQuestionAttempt(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lesson_question_attempts"
    )
    question = models.ForeignKey(LessonQuestion, on_delete=models.CASCADE, related_name="attempts")
    selected_choice = models.ForeignKey(
        LessonQuestionChoice, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    is_correct = models.BooleanField(default=False)
    points_awarded = models.PositiveIntegerField(default=0)
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "question")
        ordering = ["-attempted_at"]

    def __str__(self):
        return f"{self.user.username} · LessonQ{self.question_id} · {'✓' if self.is_correct else '✗'}"


class UserLessonProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lesson_progress"
    )
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="user_progress")
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "lesson")

    def __str__(self):
        return f"{self.user.username} · {self.lesson.title} · {'✓' if self.is_completed else '…'}"


class Task(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=120)
    content = models.TextField(help_text="Markdown body")
    order = models.PositiveIntegerField(default=1)
    points = models.PositiveIntegerField(default=10)

    class Meta:
        ordering = ["order", "id"]
        unique_together = ("room", "slug")

    def __str__(self):
        return f"{self.room.title} · {self.title}"


class TaskQuestion(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="questions")
    prompt = models.CharField(max_length=400)
    kind = models.CharField(max_length=16, choices=TaskAnswerKind.choices, default=TaskAnswerKind.TEXT)
    answer = models.CharField(max_length=255, blank=True, default="")
    hint = models.TextField(blank=True, default="")
    hint_cost = models.PositiveIntegerField(default=5)
    explanation = models.TextField(blank=True, default="")
    points = models.PositiveIntegerField(default=10)
    order = models.PositiveIntegerField(default=1)
    case_sensitive = models.BooleanField(default=False)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.task.title} · Q{self.order}"

    def check_answer(self, submitted):
        if self.kind == TaskAnswerKind.REVIEW:
            return None
        expected = (self.answer or "").strip()
        provided = (submitted or "").strip()
        if self.kind == TaskAnswerKind.NUMERIC:
            try:
                return float(provided) == float(expected)
            except (TypeError, ValueError):
                return False
        if self.case_sensitive:
            return provided == expected
        return provided.casefold() == expected.casefold()


class TaskQuestionChoice(models.Model):
    question = models.ForeignKey(TaskQuestion, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.question.prompt[:40]} → {self.text[:30]}"


class UserTaskProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="task_progress")
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="user_progress")
    completed = models.BooleanField(default=False)
    earned_points = models.PositiveIntegerField(default=0)
    hint_used = models.BooleanField(default=False)
    first_attempt_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "task")
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user.username} · {self.task.title} · {'✓' if self.completed else '…'}"


class UserQuestionAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="task_answers")
    question = models.ForeignKey(TaskQuestion, on_delete=models.CASCADE, related_name="attempts")
    submitted_answer = models.TextField(blank=True, default="")
    is_correct = models.BooleanField(default=False)
    awarded_points = models.PositiveIntegerField(default=0)
    hint_used = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-attempted_at"]

    def __str__(self):
        return f"{self.user.username} · Q{self.question_id} · {self.is_correct}"


class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "course")

    def __str__(self):
        return f"{self.user.username} -> {self.course.title}"


class Question(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="questions")
    title = models.CharField(max_length=200)
    prompt = models.TextField()
    question_type = models.CharField(max_length=20, choices=QuestionTypeChoices.choices, default=QuestionTypeChoices.CLOSED)
    level = models.CharField(max_length=20, choices=LevelChoices.choices, default=LevelChoices.BEGINNER)
    points = models.PositiveIntegerField(default=10)
    order = models.PositiveIntegerField(default=1)
    expected_answer = models.TextField(blank=True, default="")
    starter_code = models.TextField(blank=True)
    explanation = models.TextField(blank=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class QuestionChoice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.question.title}: {self.text}"


class QuestionAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="question_attempts")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="attempts")
    submitted_answer = models.TextField(blank=True, default="")
    is_correct = models.BooleanField(default=False)
    points_awarded = models.PositiveIntegerField(default=0)
    attempt_number = models.PositiveIntegerField(default=1)
    hint_used = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-attempted_at", "-id"]

    def __str__(self):
        return f"{self.user.username} · {self.question.title} · try {self.attempt_number}"


class Exam(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="exams")
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    instructions = models.TextField(blank=True)
    level = models.CharField(max_length=20, choices=LevelChoices.choices, default=LevelChoices.BEGINNER)
    time_limit_minutes = models.PositiveIntegerField(default=45)
    is_published = models.BooleanField(default=True)
    questions = models.ManyToManyField(Question, through="ExamQuestion", related_name="exams")

    def __str__(self):
        return self.title


class ExamQuestion(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order", "id"]
        unique_together = ("exam", "question")

    def __str__(self):
        return f"{self.exam.title} -> {self.question.title}"


class ExamAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="exam_attempts")
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="attempts")
    status = models.CharField(max_length=20, choices=AttemptStatusChoices.choices, default=AttemptStatusChoices.IN_PROGRESS)
    score_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    review_pending = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at", "-id"]

    def __str__(self):
        return f"{self.user.username} - {self.exam.title}"


class ExamAttemptAnswer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(QuestionChoice, on_delete=models.SET_NULL, null=True, blank=True)
    text_answer = models.TextField(blank=True)
    is_correct = models.BooleanField(null=True, blank=True)
    awarded_points = models.PositiveIntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("attempt", "question")

    def __str__(self):
        return f"{self.attempt.id} - {self.question.title}"
