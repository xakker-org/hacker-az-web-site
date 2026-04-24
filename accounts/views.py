from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Activity, Badge, UserBadge, UserProfile
from .serializers import (
    ActivitySerializer,
    BadgeSerializer,
    ClientTokenObtainPairSerializer,
    LeaderboardEntrySerializer,
    RegisterSerializer,
    UserBadgeSerializer,
    UserProfileSerializer,
)


class ClientTokenObtainPairView(TokenObtainPairView):
    serializer_class = ClientTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class MeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(
            {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "is_staff": request.user.is_staff,
                "is_superuser": request.user.is_superuser,
                "account_type": "admin" if request.user.is_staff or request.user.is_superuser else "client",
                "profile": UserProfileSerializer(profile).data,
            }
        )


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(UserProfileSerializer(profile).data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PublicProfileView(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username__iexact=username)
        except User.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=404)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        data = UserProfileSerializer(profile).data
        activity = Activity.objects.filter(user=user)[:20]
        data["activity"] = ActivitySerializer(activity, many=True).data
        return Response(data)


class MyActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get("limit", 30))
        activity = Activity.objects.filter(user=request.user)[: max(1, min(limit, 100))]
        return Response(ActivitySerializer(activity, many=True).data)


class LeaderboardView(APIView):
    def get(self, request):
        scope = request.query_params.get("scope", "all")
        qs = UserProfile.objects.filter(user__is_staff=False, user__is_superuser=False).select_related("user")
        qs = qs.order_by("-xp")[:50]
        return Response({
            "scope": scope,
            "entries": LeaderboardEntrySerializer(qs, many=True).data,
        })


class BadgeListView(APIView):
    def get(self, request):
        badges = Badge.objects.all()
        holders_map = {}
        if request.user.is_authenticated:
            holders_map = {
                ub.badge_id: ub
                for ub in UserBadge.objects.filter(user=request.user)
            }
        payload = []
        for badge in badges:
            item = BadgeSerializer(badge).data
            owned = holders_map.get(badge.id)
            item["earned"] = bool(owned)
            item["earned_at"] = owned.earned_at if owned else None
            payload.append(item)
        return Response(payload)


class MyBadgesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = UserBadge.objects.filter(user=request.user).select_related("badge")
        return Response(UserBadgeSerializer(qs, many=True).data)
