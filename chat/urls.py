from django.urls import path
from .views import ConversationListView, ConversationStartView, MessageListView, MessageSendView

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('conversations/start/', ConversationStartView.as_view(), name='conversation-start'),
    path('conversations/<uuid:conversation_id>/messages/', MessageListView.as_view(), name='message-list'),
    path('conversations/<uuid:conversation_id>/send/', MessageSendView.as_view(), name='message-send'),
]
