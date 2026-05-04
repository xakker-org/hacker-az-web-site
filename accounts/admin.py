from django.contrib import admin
from django.utils.html import format_html

from .models import Activity, Badge, UserBadge, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display  = ("user", "xp_display", "rank", "streak_days", "tasks_completed", "rooms_completed", "best_streak")
    list_filter   = ("rank",)
    search_fields = ("user__username", "user__email")
    readonly_fields = ("user", "xp", "rank", "streak_days", "best_streak", "tasks_completed", "rooms_completed", "last_activity")
    ordering      = ("-xp",)
    fieldsets = (
        ("İstifadəçi", {"fields": ("user",)}),
        ("Gamification", {"fields": ("xp", "rank", "streak_days", "best_streak")}),
        ("Statistika", {"fields": ("tasks_completed", "rooms_completed", "last_activity")}),
    )

    @admin.display(description="XP", ordering="xp")
    def xp_display(self, obj):
        return format_html('<strong style="color:#ff8099">★ {}</strong>', obj.xp)


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display  = ("icon_preview", "slug", "name", "criteria", "criteria_value", "order", "earned_count")
    list_filter   = ("criteria",)
    search_fields = ("slug", "name", "description")
    prepopulated_fields = {"slug": ("name",)}
    ordering      = ("order", "slug")

    @admin.display(description="İkon")
    def icon_preview(self, obj):
        return format_html('<span style="font-size:22px">{}</span>', obj.icon or "✦")

    @admin.display(description="Qazanılıb")
    def earned_count(self, obj):
        return obj.user_badges.count()


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display  = ("user", "badge", "earned_at")
    list_filter   = ("badge",)
    search_fields = ("user__username", "badge__name")
    readonly_fields = ("earned_at",)
    date_hierarchy = "earned_at"


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display  = ("user", "kind_badge", "title", "xp_delta_display", "created_at")
    list_filter   = ("kind",)
    search_fields = ("user__username", "title")
    readonly_fields = ("user", "kind", "title", "detail", "xp_delta", "created_at")
    date_hierarchy  = "created_at"
    ordering        = ("-created_at",)

    def has_add_permission(self, _request): return False
    def has_change_permission(self, _request, _obj=None): return False

    @admin.display(description="Tip")
    def kind_badge(self, obj):
        colors = {
            "task_complete": "#4ce0a5",
            "room_complete": "#5b8bff",
            "badge_earned":  "#ffb86b",
            "rank_up":       "#ff5672",
            "exam_submit":   "#9d7bff",
        }
        color = colors.get(obj.kind, "#8690a8")
        return format_html('<span style="color:{};font-weight:700">{}</span>', color, obj.kind)

    @admin.display(description="XP")
    def xp_delta_display(self, obj):
        if obj.xp_delta > 0:
            return format_html('<span style="color:#4ce0a5;font-weight:700">+{}</span>', obj.xp_delta)
        if obj.xp_delta < 0:
            return format_html('<span style="color:#ff5672">{}</span>', obj.xp_delta)
        return "—"
