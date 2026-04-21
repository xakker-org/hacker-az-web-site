from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
from django.views.generic import TemplateView


def health(request):
    return JsonResponse({"status": "ok", "domain": "platform"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/auth/", include("accounts.urls")),
    path("api/courses/", include("courses.urls")),
    re_path(r"^(?!api/|admin/).*$", TemplateView.as_view(template_name="spa-shell.html"), name="platform-spa"),
]
