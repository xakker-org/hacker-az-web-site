from django.contrib import admin
from django import forms

from .models import (
    Category,
    Course,
    Lesson,
    LessonQuestion,
    LessonQuestionChoice,
    LessonQuestionAttempt,
    Question,
    QuestionTypeChoices,
    QuestionAttempt,
    QuestionChoice,
    UserLessonProgress,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "color")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}


# ----- Lesson / Course admin -----

class LessonQuestionChoiceInline(admin.TabularInline):
    model = LessonQuestionChoice
    extra = 4
    fields = ("text", "is_correct", "order")


class LessonQuestionInline(admin.StackedInline):
    model = LessonQuestion
    extra = 1
    fields = ("text", "explanation", "at_seconds", "points", "order")
    show_change_link = True


@admin.register(LessonQuestion)
class LessonQuestionAdmin(admin.ModelAdmin):
    list_display = ("__str__", "lesson", "at_seconds", "points", "order")
    list_filter = ("lesson__course",)
    search_fields = ("text", "lesson__title", "lesson__course__title")
    inlines = [LessonQuestionChoiceInline]
    fieldsets = (
        (None, {"fields": ("lesson", "text", "explanation", "points", "order")}),
        ("Video timestamp", {
            "fields": ("at_seconds",),
            "description": "Leave blank for inline questions. Set seconds for video timeline questions (e.g. 120 = 2:00).",
        }),
    )


class LessonInline(admin.StackedInline):
    model = Lesson
    extra = 1
    fields = ("title", "video_url", "content", "order")
    show_change_link = True


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "order", "has_video", "question_count")
    list_filter = ("course",)
    search_fields = ("title", "course__title")
    inlines = [LessonQuestionInline]
    fieldsets = (
        (None, {"fields": ("course", "title", "order")}),
        ("Content", {"fields": ("content",)}),
        ("Video", {
            "fields": ("video_url",),
            "description": "YouTube URL (https://youtu.be/...) or direct video file URL (.mp4).",
        }),
    )

    @admin.display(boolean=True, description="Has video")
    def has_video(self, obj):
        return bool(obj.video_url)

    @admin.display(description="Questions")
    def question_count(self, obj):
        return obj.lesson_questions.count()


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "category", "is_published", "lesson_count")
    list_filter = ("is_published", "category")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [LessonInline]

    @admin.display(description="Lessons")
    def lesson_count(self, obj):
        return obj.lessons.count()


@admin.register(LessonQuestionAttempt)
class LessonQuestionAttemptAdmin(admin.ModelAdmin):
    list_display = ("user", "question", "is_correct", "points_awarded", "attempted_at")
    list_filter = ("is_correct",)
    search_fields = ("user__username",)
    readonly_fields = ("user", "question", "selected_choice", "is_correct", "points_awarded", "attempted_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(UserLessonProgress)
class UserLessonProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "lesson", "is_completed", "completed_at")
    list_filter = ("is_completed",)
    search_fields = ("user__username", "lesson__title")
    readonly_fields = ("user", "lesson", "is_completed", "completed_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


# ----- Self-study Question admin -----

class QuestionAdminForm(forms.ModelForm):
    option_a = forms.CharField(
        required=False,
        label="Variant A mətni",
        widget=forms.TextInput(attrs={"class": "vTextField", "placeholder": "A variantının mətni (məs: 192.168.1.1)"}),
    )
    option_b = forms.CharField(
        required=False,
        label="Variant B mətni",
        widget=forms.TextInput(attrs={"class": "vTextField", "placeholder": "B variantının mətni"}),
    )
    option_c = forms.CharField(
        required=False,
        label="Variant C mətni",
        widget=forms.TextInput(attrs={"class": "vTextField", "placeholder": "C variantının mətni"}),
    )
    option_d = forms.CharField(
        required=False,
        label="Variant D mətni",
        widget=forms.TextInput(attrs={"class": "vTextField", "placeholder": "D variantının mətni"}),
    )
    option_e = forms.CharField(
        required=False,
        label="Variant E mətni (könüllü)",
        widget=forms.TextInput(attrs={"class": "vTextField", "placeholder": "E variantının mətni (boş qala bilər)"}),
    )
    correct_option = forms.ChoiceField(
        required=False,
        label="Düzgün variant",
        help_text="Yuxarıda doldurduğunuz variantlardan hansının düzgün olduğunu seçin.",
        choices=[
            ("", "— Seçin —"),
            ("A", "A"),
            ("B", "B"),
            ("C", "C"),
            ("D", "D"),
            ("E", "E"),
        ],
    )

    class Meta:
        model = Question
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["expected_answer"].label = "Gözlənilən cavab"
        self.fields["expected_answer"].help_text = (
            "Open/Terminal sual üçün düzgün cavabı bura yazın. Tələbənin daxil etdiyi mətn "
            "bununla tutuşdurulacaq (böyük/kiçik hərf fərq etmir, baş və son boşluqlar təmizlənir). "
            "Bir neçə düzgün variant üçün hər birini yeni sətirdə yazın."
        )
        self.fields["expected_answer"].widget.attrs.update(
            {"placeholder": "Məs: ping, ls -la, 42"}
        )
        self.fields["starter_code"].help_text = (
            "Terminal sualı üçün tələbəyə göstəriləcək başlanğıc kod/ipucu (könüllü)."
        )

        if not self.instance.pk:
            return

        choices = list(self.instance.choices.order_by("order", "id")[:5])
        letters = ["a", "b", "c", "d", "e"]
        for idx, choice in enumerate(choices):
            letter = letters[idx]
            self.fields[f"option_{letter}"].initial = choice.text
            if choice.is_correct:
                self.fields["correct_option"].initial = letter.upper()

    def clean(self):
        cleaned = super().clean()
        question_type = cleaned.get("question_type")
        expected_answer = (cleaned.get("expected_answer") or "").strip()

        option_map = {
            "A": (cleaned.get("option_a") or "").strip(),
            "B": (cleaned.get("option_b") or "").strip(),
            "C": (cleaned.get("option_c") or "").strip(),
            "D": (cleaned.get("option_d") or "").strip(),
            "E": (cleaned.get("option_e") or "").strip(),
        }
        filled_options = {key: value for key, value in option_map.items() if value}
        correct_option = cleaned.get("correct_option")

        if question_type == QuestionTypeChoices.CLOSED:
            if len(filled_options) < 2:
                raise forms.ValidationError(
                    "Closed (bağlı) sual üçün minimum 2 variant mətni doldurulmalıdır (A və B)."
                )
            if not correct_option:
                raise forms.ValidationError("Closed sual üçün düzgün varianti seçin (A/B/C/D/E).")
            if correct_option not in filled_options:
                raise forms.ValidationError(
                    f"Düzgün variant olaraq {correct_option} seçmisiniz, lakin həmin variantın mətni boşdur."
                )
            cleaned["expected_answer"] = ""
        else:
            if not expected_answer:
                kind = "Terminal" if question_type == QuestionTypeChoices.TERMINAL else "Open"
                raise forms.ValidationError(
                    f"{kind} sual üçün 'Gözlənilən cavab' sahəsini doldurun."
                )
            if filled_options or correct_option:
                raise forms.ValidationError(
                    "Open/Terminal sual üçün variant sahələri boş olmalıdır — yalnız 'Gözlənilən cavab' sahəsini doldurun."
                )

        return cleaned

    def save(self, commit=True):
        question = super().save(commit=False)
        question.save()  # PK olmadan choices FK-sına əlçatmaq mümkün deyil
        self._sync_choices(question)
        return question

    def _sync_choices(self, question):
        if question.question_type != QuestionTypeChoices.CLOSED:
            question.choices.all().delete()
            return

        option_map = [
            ("A", (self.cleaned_data.get("option_a") or "").strip()),
            ("B", (self.cleaned_data.get("option_b") or "").strip()),
            ("C", (self.cleaned_data.get("option_c") or "").strip()),
            ("D", (self.cleaned_data.get("option_d") or "").strip()),
            ("E", (self.cleaned_data.get("option_e") or "").strip()),
        ]
        correct_option = self.cleaned_data.get("correct_option")

        question.choices.all().delete()
        order = 1
        for letter, text in option_map:
            if not text:
                continue
            QuestionChoice.objects.create(
                question=question,
                text=text,
                is_correct=(letter == correct_option),
                order=order,
            )
            order += 1


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    form = QuestionAdminForm
    list_display = ("title", "course", "question_type", "level", "points", "order")
    list_filter = ("question_type", "level", "course")
    search_fields = ("title", "prompt", "course__title")
    list_select_related = ("course",)
    ordering = ("course__title", "order", "id")
    fieldsets = (
        (
            "Əsas məlumatlar",
            {
                "fields": (
                    "course",
                    "title",
                    "prompt",
                    "question_type",
                    "level",
                    "points",
                    "order",
                ),
                "description": (
                    "Sualın tipini aşağıda seçin. Seçdiyiniz tipə uyğun sahələr avtomatik açılacaq: "
                    "<b>Closed</b> — variantlı test, <b>Open</b> — sərbəst mətnlə cavab, "
                    "<b>Terminal</b> — tələbə terminalda yazmalı olan əmr."
                ),
            },
        ),
        (
            "🅰️ Closed (Variantlı test) — variant mətnləri",
            {
                "classes": ("question-section", "question-section-closed"),
                "fields": (
                    "option_a",
                    "option_b",
                    "option_c",
                    "option_d",
                    "option_e",
                    "correct_option",
                ),
                "description": (
                    "Bu bölmə yalnız sual tipi <b>Closed</b> olduqda istifadə olunur. "
                    "Ən az A və B variantlarını doldurun, sonra aşağıda hansının düzgün olduğunu seçin."
                ),
            },
        ),
        (
            "✍️ Open / 💻 Terminal — gözlənilən cavab",
            {
                "classes": ("question-section", "question-section-openterminal"),
                "fields": ("expected_answer",),
                "description": (
                    "Bu bölmə <b>Open</b> və ya <b>Terminal</b> tipli suallar üçündür. "
                    "Tələbənin daxil etdiyi cavab burada yazdığınız mətnlə müqayisə olunur."
                ),
            },
        ),
        (
            "💻 Terminal — başlanğıc kodu",
            {
                "classes": ("question-section", "question-section-terminal"),
                "fields": ("starter_code",),
                "description": "Yalnız Terminal tipli suallar üçündür (könüllü).",
            },
        ),
        (
            "İzah (bütün tiplər üçün)",
            {
                "fields": ("explanation",),
                "description": "Tələbə cavab verdikdən sonra göstəriləcək izah (könüllü).",
            },
        ),
    )

    class Media:
        js = ("admin/js/question_admin.js",)


@admin.register(QuestionAttempt)
class QuestionAttemptAdmin(admin.ModelAdmin):
    list_display = ("user", "question", "attempt_number", "is_correct", "points_awarded", "hint_used", "attempted_at")
    list_filter = ("is_correct", "hint_used", "question__question_type", "question__level", "question__course")
    search_fields = ("user__username", "question__title", "question__course__title")
    readonly_fields = (
        "user",
        "question",
        "submitted_answer",
        "is_correct",
        "points_awarded",
        "attempt_number",
        "hint_used",
        "attempted_at",
    )
    list_select_related = ("user", "question", "question__course")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
