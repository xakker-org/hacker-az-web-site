from django.urls import path

from .views import (
    CabinetView,
    CategoryListView,
    CourseDetailView,
    CourseListView,
    EnrollmentCreateView,
    ExamAttemptCreateView,
    ExamAttemptSubmitView,
    ExamDetailView,
    ExamListView,
    LearningPlanDetailView,
    LearningPlanListView,
    QuestionDetailView,
    QuestionListView,
    QuestionSubmitAnswerView,
    RoomDetailView,
    RoomEnrollView,
    RoomListView,
    RoomTagListView,
    TaskAnswerSubmitView,
    TaskDetailView,
    TaskHintView,
    UserQuestionProgressView,
)

urlpatterns = [
    path("", CourseListView.as_view(), name="course-list"),
    path("cabinet/", CabinetView.as_view(), name="cabinet"),

    # Plans
    path("plans/", LearningPlanListView.as_view(), name="learning-plan-list"),
    path("plans/<slug:slug>/", LearningPlanDetailView.as_view(), name="learning-plan-detail"),

    # Rooms / tasks
    path("rooms/", RoomListView.as_view(), name="room-list"),
    path("rooms/tags/", RoomTagListView.as_view(), name="room-tags"),
    path("rooms/<slug:slug>/", RoomDetailView.as_view(), name="room-detail"),
    path("rooms/<slug:slug>/enroll/", RoomEnrollView.as_view(), name="room-enroll"),
    path("rooms/<slug:room_slug>/tasks/<slug:task_slug>/", TaskDetailView.as_view(), name="task-detail"),
    path("rooms/<slug:room_slug>/tasks/<slug:task_slug>/answer/", TaskAnswerSubmitView.as_view(), name="task-answer"),
    path(
        "rooms/<slug:room_slug>/tasks/<slug:task_slug>/hint/<int:question_id>/",
        TaskHintView.as_view(),
        name="task-hint",
    ),

    # Self-study questions
    path("questions/", QuestionListView.as_view(), name="question-list"),
    path("questions/<int:id>/", QuestionDetailView.as_view(), name="question-detail"),
    path("questions/<int:id>/submit-answer/", QuestionSubmitAnswerView.as_view(), name="question-submit-answer"),
    path("user/questions-progress/", UserQuestionProgressView.as_view(), name="user-question-progress"),

    # Categories
    path("categories/", CategoryListView.as_view(), name="category-list"),

    # Exams (legacy flow preserved)
    path("exams/", ExamListView.as_view(), name="exam-list"),
    path("exams/<slug:slug>/", ExamDetailView.as_view(), name="exam-detail"),
    path("exams/<slug:slug>/attempts/", ExamAttemptCreateView.as_view(), name="exam-attempt-create"),
    path("exams/<slug:slug>/submit/", ExamAttemptSubmitView.as_view(), name="exam-attempt-submit"),

    # Enrollment
    path("enroll/", EnrollmentCreateView.as_view(), name="course-enroll"),

    # Course detail (keep last so "plans" etc. not shadowed)
    path("<slug:slug>/", CourseDetailView.as_view(), name="course-detail"),
]
