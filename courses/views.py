from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status

from .models import Course, Enrollment
from .serializers import CourseListSerializer, CourseDetailSerializer, EnrollmentSerializer

class CourseListView(generics.ListAPIView):
    queryset = Course.objects.filter(is_published=True)
    serializer_class = CourseListSerializer

class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.filter(is_published=True)
    serializer_class = CourseDetailSerializer
    lookup_field = "slug"

class EnrollmentCreateView(generics.CreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user,
            course=serializer.validated_data["course"],
        )
        payload = EnrollmentSerializer(enrollment).data
        if created:
            return Response(payload, status=status.HTTP_201_CREATED)
        return Response(
            {
                "detail": "User is already enrolled for this course.",
                "enrollment": payload,
            },
            status=status.HTTP_200_OK,
        )