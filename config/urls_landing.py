from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator


def health(request):
    return JsonResponse({"status": "ok", "domain": "landing"})


@method_decorator(never_cache, name='dispatch')
class LandingView(TemplateView):
    template_name = "index.html"

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['platform_url'] = settings.PLATFORM_URL
        return ctx


urlpatterns = [
    path("", LandingView.as_view(), name="landing-home"),
    path("api/health/", health),
    path("api/auth/", include("accounts.urls")),
    path("api/courses/", include("courses.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
