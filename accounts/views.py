from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import Account, Follow
from accounts.serializers import (
    AccountCreateSerializer, AccountLoginSerializer,
    AccountSerializer, ProfileUpdateSerializer
)


class SignupView(generics.GenericAPIView):
    serializer_class = AccountCreateSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        out_ser = AccountSerializer(user, context={'request': request})
        return Response({"message": "User created successfully", "user": out_ser.data}, status=201)


class LoginView(generics.GenericAPIView):
    serializer_class = AccountLoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': AccountSerializer(user, context={'request': request}).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/profile/<username>/"""
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'username'
    queryset = Account.objects.all()

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProfileUpdateSerializer
        return AccountSerializer

    def get_serializer_context(self):
        return {'request': self.request}


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/ — current user's own profile"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [__import__('rest_framework').parsers.MultiPartParser,
                      __import__('rest_framework').parsers.FormParser,
                      __import__('rest_framework').parsers.JSONParser]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProfileUpdateSerializer
        return AccountSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_context(self):
        return {'request': self.request}

    def partial_update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = ProfileUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Return full account data including updated profile_picture
        return Response(AccountSerializer(user, context={'request': request}).data)


class FollowToggleView(APIView):
    """POST /api/auth/follow/<username>/ — follow or unfollow"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username):
        try:
            target = Account.objects.get(username=username)
        except Account.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)

        if target == request.user:
            return Response({'error': 'You cannot follow yourself.'}, status=400)

        follow, created = Follow.objects.get_or_create(follower=request.user, following=target)
        if not created:
            follow.delete()
            return Response({'status': 'unfollowed', 'followers_count': target.followers_count})
        return Response({'status': 'followed', 'followers_count': target.followers_count})


class FollowersListView(generics.ListAPIView):
    """GET /api/auth/followers/<username>/"""
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        username = self.kwargs['username']
        return Account.objects.filter(following__following__username=username)

    def get_serializer_context(self):
        return {'request': self.request}


class FollowingListView(generics.ListAPIView):
    """GET /api/auth/following/<username>/"""
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        username = self.kwargs['username']
        return Account.objects.filter(followers__follower__username=username)

    def get_serializer_context(self):
        return {'request': self.request}
