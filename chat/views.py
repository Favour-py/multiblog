from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class ConversationListView(generics.ListAPIView):
    """GET /api/chat/conversations/ — list current user's conversations"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}


class ConversationStartView(APIView):
    """POST /api/chat/conversations/start/ — start or get conversation with a user"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        username = request.data.get('username')
        try:
            other_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)

        if other_user == request.user:
            return Response({'error': 'Cannot start conversation with yourself.'}, status=400)

        # Find existing conversation between these two users
        conversation = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=other_user
        ).first()

        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, other_user)

        return Response(ConversationSerializer(conversation, context={'request': request}).data)


class MessageListView(generics.ListAPIView):
    """GET /api/chat/conversations/<id>/messages/ — get messages in a conversation"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conv_id = self.kwargs['conversation_id']
        conversation = Conversation.objects.filter(
            id=conv_id, participants=self.request.user
        ).first()
        if not conversation:
            return Message.objects.none()
        # Mark all messages as read
        conversation.messages.exclude(sender=self.request.user).update(is_read=True)
        return conversation.messages.all()


class MessageSendView(generics.CreateAPIView):
    """POST /api/chat/conversations/<id>/messages/ — send a message"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        conv_id = self.kwargs['conversation_id']
        conversation = Conversation.objects.filter(
            id=conv_id, participants=self.request.user
        ).first()
        if not conversation:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You are not part of this conversation.")
        msg = serializer.save(sender=self.request.user, conversation=conversation)
        # bump conversation updated_at
        conversation.save()
        return msg
