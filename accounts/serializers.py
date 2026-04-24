from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Activity, Badge, UserBadge, UserProfile, RANK_THRESHOLDS


class ClientTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if self.user.is_staff or self.user.is_superuser:
            raise serializers.ValidationError("Admin users must log in from /admin/.")
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            is_staff=False,
            is_superuser=False,
        )
        UserProfile.objects.get_or_create(user=user)
        return user


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ["id", "slug", "name", "description", "icon", "color", "criteria", "criteria_value"]


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UserBadge
        fields = ["id", "badge", "earned_at"]


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ["id", "kind", "title", "detail", "xp_delta", "target_slug", "created_at"]


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    date_joined = serializers.DateTimeField(source="user.date_joined", read_only=True)
    next_rank = serializers.SerializerMethodField()
    xp_to_next = serializers.SerializerMethodField()
    rank_progress = serializers.SerializerMethodField()
    badges = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            "username",
            "email",
            "xp",
            "rank",
            "streak_days",
            "best_streak",
            "last_activity",
            "bio",
            "country",
            "avatar_hue",
            "tasks_completed",
            "rooms_completed",
            "date_joined",
            "next_rank",
            "xp_to_next",
            "rank_progress",
            "badges",
        ]
        read_only_fields = [
            "xp",
            "rank",
            "streak_days",
            "best_streak",
            "last_activity",
            "tasks_completed",
            "rooms_completed",
        ]

    def _rank_window(self, xp):
        current = RANK_THRESHOLDS[0]
        next_step = None
        for threshold, rank in RANK_THRESHOLDS:
            if xp >= threshold:
                current = (threshold, rank)
            else:
                next_step = (threshold, rank)
                break
        return current, next_step

    def get_next_rank(self, obj):
        _, next_step = self._rank_window(obj.xp)
        return next_step[1] if next_step else None

    def get_xp_to_next(self, obj):
        _, next_step = self._rank_window(obj.xp)
        if not next_step:
            return 0
        return max(next_step[0] - obj.xp, 0)

    def get_rank_progress(self, obj):
        current, next_step = self._rank_window(obj.xp)
        if not next_step:
            return 100
        low = current[0]
        high = next_step[0]
        if high == low:
            return 100
        return round(((obj.xp - low) / (high - low)) * 100)

    def get_badges(self, obj):
        earned = UserBadge.objects.filter(user=obj.user).select_related("badge")
        return UserBadgeSerializer(earned, many=True).data


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "username",
            "xp",
            "rank",
            "streak_days",
            "tasks_completed",
            "rooms_completed",
            "avatar_hue",
            "country",
        ]
