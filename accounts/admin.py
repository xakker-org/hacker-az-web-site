from django.contrib import admin

from .models import Activity, Badge, UserBadge, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "xp", "rank", "streak_days", "tasks_completed", "rooms_completed")
    list_filter = ("rank",)
    search_fields = ("user__username", "user__email")


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ("slug", "name", "criteria", "criteria_value", "order")
    list_filter = ("criteria",)
    search_fields = ("slug", "name", "description")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ("user", "badge", "earned_at")
    search_fields = ("user__username", "badge__name")


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ("user", "kind", "title", "xp_delta", "created_at")
    list_filter = ("kind",)
    search_fields = ("user__username", "title")
