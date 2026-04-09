from rest_framework import serializers
from .models import Comment
from django.contrib.auth import get_user_model

User = get_user_model()


class CommentAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'profile_picture']


class CommentSerializer(serializers.ModelSerializer):
    author = CommentAuthorSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'author', 'content',
            'reply_to', 'created_at', 'updated_at', 'is_edited', 'replies'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'is_edited']

    def get_replies(self, obj):
        return CommentSerializer(
            Comment.objects.filter(reply_to=obj), many=True, context=self.context
        ).data

    def validate(self, data):
        reply_to = data.get('reply_to')
        post = data.get('post')
        if reply_to and reply_to.post != post:
            raise serializers.ValidationError({'reply_to': 'Reply must belong to the same post.'})
        return data
