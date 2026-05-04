from django.contrib import admin
from django import forms

from .models import (
    Category,
    Course,
    Enrollment,
    Exam,
    ExamAttempt,
    ExamQuestion,
    LearningPlan,
    LearningPlanCourse,
    Lesson,
    LessonQuestion,
    LessonQuestionAttempt,
    LessonQuestionChoice,
    Mission,
    MissionExam,
    MissionExamAnswer,
    MissionExamAttempt,
    MissionExamChoice,
    MissionExamQuestion,
    MissionPass,
    MissionPassCompletion,
    MissionProgress,
    Question,
    QuestionAttempt,
    QuestionChoice,
    QuestionTypeChoices,
    Room,
    RoomTag,
    Task,
    TaskQuestion,
    TaskQuestionChoice,
    UserLessonProgress,
    UserQuestionAttempt,
    UserTaskProgress,
)


# ─── Category ─────────────────────────────────────────────────────────────────

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ("name", "slug", "icon", "color", "description")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}


# ─── Lesson / Course ──────────────────────────────────────────────────────────

class LessonQuestionChoiceInline(admin.TabularInline):
    model  = LessonQuestionChoice
    extra  = 4
    fields = ("text", "is_correct", "order")


class LessonQuestionInline(admin.StackedInline):
    model  = LessonQuestion
    extra  = 1
    fields = ("text", "explanation", "at_seconds", "points", "order")
    show_change_link = True


@admin.register(LessonQuestion)
class LessonQuestionAdmin(admin.ModelAdmin):
    list_display  = ("__str__", "lesson", "at_seconds", "points", "order")
    list_filter   = ("lesson__course",)
    search_fields = ("text", "lesson__title", "lesson__course__title")
    inlines       = [LessonQuestionChoiceInline]
    fieldsets = (
        (None, {"fields": ("lesson", "text", "explanation", "points", "order")}),
        ("Video zaman damgası", {
            "fields": ("at_seconds",),
            "description": "Video suallar üçün saniyə cinsindən vaxt (məs. 120 = 2:00). Boş buraxın adi suallar üçün.",
        }),
    )


class LessonInline(admin.StackedInline):
    model  = Lesson
    extra  = 1
    fields = ("title", "video_url", "content", "order")
    show_change_link = True


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display  = ("title", "course", "order", "has_video", "question_count")
    list_filter   = ("course",)
    search_fields = ("title", "course__title")
    inlines       = [LessonQuestionInline]
    fieldsets = (
        (None, {"fields": ("course", "title", "order")}),
        ("Məzmun", {"fields": ("content",)}),
        ("Video", {
            "fields": ("video_url",),
            "description": "YouTube URL (https://youtu.be/...) və ya birbaşa video faylı (.mp4).",
        }),
    )

    @admin.display(boolean=True, description="Video var?")
    def has_video(self, obj):
        return bool(obj.video_url)

    @admin.display(description="Suallar")
    def question_count(self, obj):
        return obj.lesson_questions.count()


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display  = ("title", "slug", "category", "icon", "is_published", "lesson_count", "room_count", "exam_count")
    list_filter   = ("is_published", "category")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("is_published",)
    inlines = [LessonInline]

    @admin.display(description="Dərslər")
    def lesson_count(self, obj):
        return obj.lessons.count()

    @admin.display(description="Rooms")
    def room_count(self, obj):
        return obj.rooms.count()

    @admin.display(description="İmtahanlar")
    def exam_count(self, obj):
        return obj.exams.count()


@admin.register(LessonQuestionAttempt)
class LessonQuestionAttemptAdmin(admin.ModelAdmin):
    list_display    = ("user", "question", "is_correct", "points_awarded", "attempted_at")
    list_filter     = ("is_correct",)
    search_fields   = ("user__username",)
    readonly_fields = ("user", "question", "selected_choice", "is_correct", "points_awarded", "attempted_at")
    date_hierarchy  = "attempted_at"

    def has_add_permission(self, _request): return False
    def has_change_permission(self, _request, _obj=None): return False


@admin.register(UserLessonProgress)
class UserLessonProgressAdmin(admin.ModelAdmin):
    list_display    = ("user", "lesson", "is_completed", "completed_at")
    list_filter     = ("is_completed",)
    search_fields   = ("user__username", "lesson__title")
    readonly_fields = ("user", "lesson", "is_completed", "completed_at")

    def has_add_permission(self, _request): return False
    def has_change_permission(self, _request, _obj=None): return False


# ─── Room / Task ──────────────────────────────────────────────────────────────

class TaskQuestionChoiceInline(admin.TabularInline):
    model  = TaskQuestionChoice
    extra  = 4
    fields = ("text", "is_correct", "order")


class TaskQuestionInline(admin.StackedInline):
    model  = TaskQuestion
    extra  = 1
    fields = ("prompt", "kind", "answer", "hint", "hint_cost", "points", "order", "case_sensitive")
    show_change_link = True


class TaskInline(admin.StackedInline):
    model  = Task
    extra  = 1
    fields = ("title", "slug", "content", "order", "points")
    show_change_link = True
    prepopulated_fields = {"slug": ("title",)}


@admin.register(RoomTag)
class RoomTagAdmin(admin.ModelAdmin):
    list_display  = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display   = ("title", "course", "level", "is_published", "is_premium", "task_count", "points", "estimated_minutes", "order")
    list_filter    = ("level", "is_published", "is_premium", "course__category")
    search_fields  = ("title", "summary", "description")
    prepopulated_fields = {"slug": ("title",)}
    list_editable  = ("is_published", "is_premium", "order")
    filter_horizontal = ("tags",)
    inlines        = [TaskInline]
    fieldsets = (
        ("Əsas məlumatlar", {
            "fields": ("course", "title", "slug", "summary", "description", "icon", "cover_color"),
        }),
        ("Parametrlər", {
            "fields": ("level", "estimated_minutes", "points", "order", "is_published", "is_premium"),
        }),
        ("Teqlər", {
            "fields": ("tags",),
        }),
    )

    @admin.display(description="Tasklar")
    def task_count(self, obj):
        return obj.tasks.count()


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display  = ("title", "room", "order", "points", "question_count")
    list_filter   = ("room__course",)
    search_fields = ("title", "room__title")
    inlines       = [TaskQuestionInline]
    fieldsets = (
        (None, {"fields": ("room", "title", "slug", "order", "points")}),
        ("Məzmun (Markdown)", {"fields": ("content",)}),
    )

    @admin.display(description="Suallar")
    def question_count(self, obj):
        return obj.questions.count()


@admin.register(TaskQuestion)
class TaskQuestionAdmin(admin.ModelAdmin):
    list_display  = ("__str__", "task", "kind", "points", "hint_cost", "case_sensitive", "order")
    list_filter   = ("kind", "task__room__course")
    search_fields = ("prompt", "task__title")
    inlines       = [TaskQuestionChoiceInline]


@admin.register(UserTaskProgress)
class UserTaskProgressAdmin(admin.ModelAdmin):
    list_display    = ("user", "task", "completed", "earned_points", "hint_used", "completed_at")
    list_filter     = ("completed", "hint_used")
    search_fields   = ("user__username", "task__title")
    readonly_fields = ("user", "task", "completed", "earned_points", "hint_used", "first_attempt_at", "completed_at", "updated_at")

    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False


@admin.register(UserQuestionAttempt)
class UserQuestionAttemptAdmin(admin.ModelAdmin):
    list_display    = ("user", "question", "is_correct", "awarded_points", "hint_used", "attempted_at")
    list_filter     = ("is_correct", "hint_used")
    search_fields   = ("user__username", "question__prompt")
    readonly_fields = ("user", "question", "submitted_answer", "is_correct", "awarded_points", "hint_used", "attempted_at")
    date_hierarchy  = "attempted_at"

    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False


# ─── Self-Study Question ──────────────────────────────────────────────────────

class QuestionAdminForm(forms.ModelForm):
    option_a = forms.CharField(required=False, label="Variant A", widget=forms.TextInput(attrs={"class": "vTextField"}))
    option_b = forms.CharField(required=False, label="Variant B", widget=forms.TextInput(attrs={"class": "vTextField"}))
    option_c = forms.CharField(required=False, label="Variant C", widget=forms.TextInput(attrs={"class": "vTextField"}))
    option_d = forms.CharField(required=False, label="Variant D", widget=forms.TextInput(attrs={"class": "vTextField"}))
    option_e = forms.CharField(required=False, label="Variant E (könüllü)", widget=forms.TextInput(attrs={"class": "vTextField"}))
    correct_option = forms.ChoiceField(
        required=False, label="Düzgün variant",
        choices=[("", "— Seçin —"), ("A", "A"), ("B", "B"), ("C", "C"), ("D", "D"), ("E", "E")],
    )

    class Meta:
        model  = Question
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["expected_answer"].label = "Gözlənilən cavab"
        self.fields["expected_answer"].help_text = (
            "Open/Terminal sual üçün düzgün cavab. Bir neçə düzgün variant üçün hər birini yeni sətirdə yazın."
        )
        self.fields["expected_answer"].widget.attrs.update({"placeholder": "Məs: ping, ls -la, 42"})
        self.fields["starter_code"].help_text = "Terminal sualı üçün başlanğıc kod/ipucu (könüllü)."

        if not self.instance.pk:
            return
        choices = list(self.instance.choices.order_by("order", "id")[:5])
        for idx, choice in enumerate(choices):
            letter = ["a", "b", "c", "d", "e"][idx]
            self.fields[f"option_{letter}"].initial = choice.text
            if choice.is_correct:
                self.fields["correct_option"].initial = letter.upper()

    def clean(self):
        cleaned   = super().clean()
        q_type    = cleaned.get("question_type")
        expected  = (cleaned.get("expected_answer") or "").strip()
        opt_map   = {k: (cleaned.get(f"option_{k.lower()}") or "").strip() for k in "ABCDE"}
        filled    = {k: v for k, v in opt_map.items() if v}
        correct   = cleaned.get("correct_option")

        if q_type == QuestionTypeChoices.CLOSED:
            if len(filled) < 2:
                raise forms.ValidationError("Closed sual üçün minimum 2 variant doldurulmalıdır.")
            if not correct:
                raise forms.ValidationError("Düzgün variantı seçin.")
            if correct not in filled:
                raise forms.ValidationError(f"Düzgün variant {correct} seçildi, lakin mətni boşdur.")
            cleaned["expected_answer"] = ""
        else:
            if not expected:
                raise forms.ValidationError(f"{'Terminal' if q_type == QuestionTypeChoices.TERMINAL else 'Open'} sual üçün 'Gözlənilən cavab' doldurun.")
            if filled or correct:
                raise forms.ValidationError("Open/Terminal suallar üçün variant sahələri boş olmalıdır.")
        return cleaned

    def save(self, commit=True):
        question = super().save(commit=False)
        question.save()
        self._sync_choices(question)
        return question

    def _sync_choices(self, question):
        if question.question_type != QuestionTypeChoices.CLOSED:
            question.choices.all().delete()
            return
        opt_map = [
            ("A", (self.cleaned_data.get("option_a") or "").strip()),
            ("B", (self.cleaned_data.get("option_b") or "").strip()),
            ("C", (self.cleaned_data.get("option_c") or "").strip()),
            ("D", (self.cleaned_data.get("option_d") or "").strip()),
            ("E", (self.cleaned_data.get("option_e") or "").strip()),
        ]
        correct = self.cleaned_data.get("correct_option")
        question.choices.all().delete()
        for order, (letter, text) in enumerate(opt_map, start=1):
            if text:
                QuestionChoice.objects.create(question=question, text=text, is_correct=(letter == correct), order=order)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    form          = QuestionAdminForm
    list_display  = ("title", "course", "question_type", "level", "points", "order", "attempt_count")
    list_filter   = ("question_type", "level", "course")
    search_fields = ("title", "prompt", "course__title")
    list_select_related = ("course",)
    ordering      = ("course__title", "order", "id")
    list_editable = ("order",)
    fieldsets = (
        ("Əsas məlumatlar", {
            "fields": ("course", "title", "prompt", "question_type", "level", "points", "order"),
            "description": (
                "<b>Closed</b> → variantlı test, "
                "<b>Open</b> → sərbəst mətn, "
                "<b>Terminal</b> → komanda cavabı."
            ),
        }),
        ("🅰️ Closed — variantlar", {
            "classes": ("question-section", "question-section-closed"),
            "fields": ("option_a", "option_b", "option_c", "option_d", "option_e", "correct_option"),
        }),
        ("✍️ Open / 💻 Terminal — gözlənilən cavab", {
            "classes": ("question-section", "question-section-openterminal"),
            "fields": ("expected_answer",),
        }),
        ("💻 Terminal — başlanğıc kodu", {
            "classes": ("question-section", "question-section-terminal"),
            "fields": ("starter_code",),
        }),
        ("İzah", {"fields": ("explanation",)}),
    )

    class Media:
        js = ("admin/js/question_admin.js",)

    @admin.display(description="Cəhd sayı")
    def attempt_count(self, obj):
        return obj.attempts.count()


@admin.register(QuestionAttempt)
class QuestionAttemptAdmin(admin.ModelAdmin):
    list_display    = ("user", "question", "attempt_number", "is_correct", "points_awarded", "hint_used", "attempted_at")
    list_filter     = ("is_correct", "hint_used", "question__question_type", "question__level", "question__course")
    search_fields   = ("user__username", "question__title", "question__course__title")
    readonly_fields = ("user", "question", "submitted_answer", "is_correct", "points_awarded", "attempt_number", "hint_used", "attempted_at")
    list_select_related = ("user", "question", "question__course")
    date_hierarchy  = "attempted_at"

    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False


# ─── Learning Plan ────────────────────────────────────────────────────────────

class LearningPlanCourseInline(admin.TabularInline):
    model  = LearningPlanCourse
    extra  = 2
    fields = ("course", "order")


@admin.register(LearningPlan)
class LearningPlanAdmin(admin.ModelAdmin):
    list_display  = ("title", "slug", "level", "is_featured", "is_published", "estimated_hours", "course_count")
    list_filter   = ("level", "is_featured", "is_published")
    search_fields = ("title", "summary", "description")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("is_featured", "is_published")
    inlines       = [LearningPlanCourseInline]

    @admin.display(description="Kurslar")
    def course_count(self, obj):
        return obj.courses.count()


# ─── Exam ─────────────────────────────────────────────────────────────────────

class ExamQuestionInline(admin.TabularInline):
    model  = ExamQuestion
    extra  = 2
    fields = ("question", "order")
    autocomplete_fields = ["question"]


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display  = ("title", "slug", "course", "level", "time_limit_minutes", "is_published", "question_count", "attempt_count")
    list_filter   = ("level", "is_published", "course")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("is_published",)
    inlines       = [ExamQuestionInline]
    fieldsets = (
        ("Əsas", {"fields": ("course", "title", "slug", "description", "instructions")}),
        ("Parametrlər", {"fields": ("level", "time_limit_minutes", "is_published")}),
    )

    @admin.display(description="Suallar")
    def question_count(self, obj):
        return obj.questions.count()

    @admin.display(description="Cəhdlər")
    def attempt_count(self, obj):
        return obj.attempts.count()


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display    = ("user", "exam", "status", "score_percent", "review_pending", "started_at", "submitted_at")
    list_filter     = ("status", "review_pending", "exam")
    search_fields   = ("user__username", "exam__title")
    readonly_fields = ("user", "exam", "status", "score_percent", "review_pending", "started_at", "submitted_at")
    date_hierarchy  = "started_at"

    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False


# ─── Enrollment ───────────────────────────────────────────────────────────────

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display  = ("user", "course", "created_at")
    list_filter   = ("course",)
    search_fields = ("user__username", "course__title")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"


# ═══════════════════════════════════════════════════════════════
#  MISSION / PASS ADMIN
# ═══════════════════════════════════════════════════════════════

class MissionPassInline(admin.StackedInline):
    model  = MissionPass
    extra  = 1
    fields = ("title", "content", "order", "estimated_minutes", "is_published")
    show_change_link = True
    ordering = ("order",)


@admin.register(MissionPass)
class MissionPassAdmin(admin.ModelAdmin):
    list_display  = ("__str__", "mission", "order", "estimated_minutes", "is_published")
    list_filter   = ("is_published", "mission")
    search_fields = ("title", "mission__title")
    list_editable = ("order", "is_published")
    fieldsets = (
        (None, {"fields": ("mission", "title", "order", "estimated_minutes", "is_published")}),
        ("Content (HTML)", {
            "fields": ("content",),
            "description": "Supports standard HTML. Use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;pre&gt;, &lt;code&gt; etc.",
        }),
    )


@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display  = (
        "title", "slug", "difficulty", "is_published",
        "pass_count_display", "has_exam_display", "xp_reward", "order",
    )
    list_filter   = ("difficulty", "is_published")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("is_published", "order")
    inlines       = [MissionPassInline]
    fieldsets = (
        ("Core", {
            "fields": ("title", "slug", "description", "short_description"),
        }),
        ("Appearance", {
            "fields": ("icon", "cover_color", "difficulty"),
        }),
        ("Settings", {
            "fields": ("estimated_hours", "xp_reward", "order", "is_published"),
        }),
    )

    @admin.display(description="Passes")
    def pass_count_display(self, obj):
        return obj.passes.filter(is_published=True).count()

    @admin.display(boolean=True, description="Has Exam?")
    def has_exam_display(self, obj):
        return hasattr(obj, "mission_exam") and obj.mission_exam.is_published


# ─── Mission Exam ─────────────────────────────────────────────────────────────

class MissionExamChoiceInline(admin.TabularInline):
    model  = MissionExamChoice
    extra  = 4
    fields = ("choice_text", "is_correct", "order")


class MissionExamQuestionInline(admin.StackedInline):
    model  = MissionExamQuestion
    extra  = 1
    fields = ("question_text", "order", "is_multiple", "explanation")
    show_change_link = True
    ordering = ("order",)


@admin.register(MissionExamQuestion)
class MissionExamQuestionAdmin(admin.ModelAdmin):
    list_display  = ("__str__", "exam", "order", "is_multiple")
    list_filter   = ("exam__mission",)
    search_fields = ("question_text", "exam__title")
    inlines       = [MissionExamChoiceInline]
    fieldsets = (
        (None, {"fields": ("exam", "question_text", "order", "is_multiple")}),
        ("Explanation (shown after exam)", {"fields": ("explanation",)}),
    )


@admin.register(MissionExam)
class MissionExamAdmin(admin.ModelAdmin):
    list_display  = (
        "title", "mission", "passing_score", "time_limit_minutes",
        "max_attempts", "xp_reward", "is_published", "question_count",
    )
    list_filter   = ("is_published",)
    search_fields = ("title", "mission__title")
    list_editable = ("is_published",)
    inlines       = [MissionExamQuestionInline]
    fieldsets = (
        ("Core", {"fields": ("mission", "title", "description")}),
        ("Rules", {
            "fields": ("passing_score", "time_limit_minutes", "max_attempts", "xp_reward", "is_published"),
            "description": "passing_score is a percentage (0-100). Set time_limit_minutes=0 for no limit. Set max_attempts=0 for unlimited.",
        }),
    )

    @admin.display(description="Questions")
    def question_count(self, obj):
        return obj.questions.count()


# ─── Mission Progress (read-only) ─────────────────────────────────────────────

@admin.register(MissionProgress)
class MissionProgressAdmin(admin.ModelAdmin):
    list_display    = ("user", "mission", "is_completed", "exam_passed", "started_at", "completed_at")
    list_filter     = ("is_completed", "exam_passed", "mission")
    search_fields   = ("user__username", "mission__title")
    readonly_fields = ("user", "mission", "is_completed", "exam_passed", "started_at", "completed_at")
    date_hierarchy  = "started_at"

    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False


@admin.register(MissionPassCompletion)
class MissionPassCompletionAdmin(admin.ModelAdmin):
    list_display    = ("user", "mission_pass", "completed_at")
    list_filter     = ("mission_pass__mission",)
    search_fields   = ("user__username", "mission_pass__title")
    readonly_fields = ("user", "mission_pass", "completed_at")

    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False


@admin.register(MissionExamAttempt)
class MissionExamAttemptAdmin(admin.ModelAdmin):
    list_display    = ("user", "exam", "attempt_number", "score", "passed", "started_at", "submitted_at")
    list_filter     = ("passed", "exam__mission")
    search_fields   = ("user__username", "exam__title")
    readonly_fields = ("user", "exam", "attempt_number", "score", "passed", "started_at", "submitted_at")
    date_hierarchy  = "started_at"

    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False


@admin.register(MissionExamAnswer)
class MissionExamAnswerAdmin(admin.ModelAdmin):
    list_display    = ("attempt", "question")
    search_fields   = ("attempt__user__username",)
    readonly_fields = ("attempt", "question", "selected_choices")

    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False
