from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from django.views.generic import TemplateView


def health(request):
    return JsonResponse({"status": "ok", "domain": "landing"})


urlpatterns = [
    path("", TemplateView.as_view(template_name="index.html"), name="landing-home"),
    path("api/health/", health),
]
