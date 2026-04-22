from django.urls import path
from .views import (
    CabinetView,
    CourseDetailView,
    CourseListView,
    EnrollmentCreateView,
    ExamAttemptCreateView,
    ExamAttemptSubmitView,
    ExamDetailView,
    ExamListView,
    LearningPlanListView,
)

urlpatterns = [
    path("", CourseListView.as_view(), name="course-list"),
    path("cabinet/", CabinetView.as_view(), name="cabinet"),
    path("plans/", LearningPlanListView.as_view(), name="learning-plan-list"),
    path("exams/", ExamListView.as_view(), name="exam-list"),
    path("exams/<slug:slug>/", ExamDetailView.as_view(), name="exam-detail"),
    path("exams/<slug:slug>/attempts/", ExamAttemptCreateView.as_view(), name="exam-attempt-create"),
    path("exams/<slug:slug>/submit/", ExamAttemptSubmitView.as_view(), name="exam-attempt-submit"),
    path("enroll/", EnrollmentCreateView.as_view(), name="course-enroll"),
    path("<slug:slug>/", CourseDetailView.as_view(), name="course-detail"),
]