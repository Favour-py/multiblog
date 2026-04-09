from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Comment
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .serializers import CommentSerializer
from .permissions import IsAuthorOrReadOnly

# Create your views here.

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filterset_fields = ['post']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
