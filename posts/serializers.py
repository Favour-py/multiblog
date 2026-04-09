from rest_framework import serializers
from django.contrib.auth import get_user_model
from posts.models import Post, Like
from comments.serializers import CommentSerializer

User = get_user_model()


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_picture']


class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    comments_count = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'title', 'content', 'category', 'image',
            'likes_count', 'is_liked', 'shares_count', 'comments_enabled',
            'created_at', 'updated_at', 'comments_count', 'comments',
        ]
        read_only_fields = [
            'id', 'author', 'likes_count', 'is_liked', 'shares_count',
            'created_at', 'updated_at', 'comments_count', 'comments',
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_comments_count(self, obj):
        return obj.comments.filter(reply_to__isnull=True).count()

    def get_comments(self, obj):
        top_level = obj.comments.filter(reply_to__isnull=True)
        return CommentSerializer(top_level, many=True, context=self.context).data

    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters.")
        return value

    def validate_content(self, value):
        if len(value) < 20:
            raise serializers.ValidationError("Content must be at least 20 characters.")
        return value
