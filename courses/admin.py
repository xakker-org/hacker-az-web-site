from django.contrib import admin
from .models import (
    Category,
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

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "slug", "is_published")
    prepopulated_fields = {"slug": ("title",)}


class LearningPlanCourseInline(admin.TabularInline):
    model = LearningPlanCourse
    extra = 1


@admin.register(LearningPlan)
class LearningPlanAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "slug", "level", "is_featured", "is_published")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [LearningPlanCourseInline]


class QuestionChoiceInline(admin.TabularInline):
    model = QuestionChoice
    extra = 3


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "course", "question_type", "level", "points", "order")
    list_filter = ("question_type", "level", "course")
    search_fields = ("title", "prompt")
    inlines = [QuestionChoiceInline]


class ExamQuestionInline(admin.TabularInline):
    model = ExamQuestion
    extra = 1


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "course", "level", "time_limit_minutes", "is_published")
    list_filter = ("level", "is_published", "course")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ExamQuestionInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "course", "order")

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "course", "created_at")


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "exam", "status", "score_percent", "review_pending", "started_at")
    list_filter = ("status", "review_pending", "exam")
    search_fields = ("user__username", "exam__title")


@admin.register(ExamAttemptAnswer)
class ExamAttemptAnswerAdmin(admin.ModelAdmin):
    list_display = ("id", "attempt", "question", "is_correct", "awarded_points", "submitted_at")