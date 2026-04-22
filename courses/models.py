from django.conf import settings
from django.db import models


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

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Course(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class LearningPlan(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    summary = models.CharField(max_length=255)
    level = models.CharField(max_length=20, choices=LevelChoices.choices, default=LevelChoices.BEGINNER)
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

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    content = models.TextField()
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"

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