from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import ClientTokenObtainPairSerializer, RegisterSerializer


class ClientTokenObtainPairView(TokenObtainPairView):
    serializer_class = ClientTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class MeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "is_staff": request.user.is_staff,
                "is_superuser": request.user.is_superuser,
                "account_type": "admin" if request.user.is_staff or request.user.is_superuser else "client",
            }
        )
