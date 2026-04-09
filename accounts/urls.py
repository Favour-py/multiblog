from django.urls import path
from accounts.views import (
    SignupView, LoginView, ProfileView, MeView,
    FollowToggleView, FollowersListView, FollowingListView
)

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('profile/<str:username>/', ProfileView.as_view(), name='profile'),
    path('follow/<str:username>/', FollowToggleView.as_view(), name='follow-toggle'),
    path('followers/<str:username>/', FollowersListView.as_view(), name='followers-list'),
    path('following/<str:username>/', FollowingListView.as_view(), name='following-list'),
]
