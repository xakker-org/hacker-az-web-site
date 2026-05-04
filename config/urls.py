from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
def health(request):
    return JsonResponse({"status": "ok"})

# Use default Django admin - Jazzmin will style it
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/auth/", include("accounts.urls")),
    path("api/courses/", include("courses.urls")),
]