from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from accounts.models import Account, Follow


class AccountSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    is_following = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'bio', 'profile_picture', 'date_joined', 'last_login',
            'followers_count', 'following_count', 'is_following',
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.profile_picture:
            url = obj.profile_picture.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class AccountCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = Account
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'bio', 'date_of_birth', 'password', 'confirm_password'
        ]
        read_only_fields = ['id']

    def validate_email(self, value):
        if Account.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with that email already exists.')
        return value

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        validate_password(attrs.get('password'))
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password')
        user = Account(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AccountLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        try:
            user = Account.objects.get(email__iexact=email)
        except Account.DoesNotExist:
            raise serializers.ValidationError('Unable to log in with provided credentials.', code='authorization')
        if not user.check_password(password):
            raise serializers.ValidationError('Unable to log in with provided credentials.', code='authorization')
        attrs['user'] = user
        return attrs


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['first_name', 'last_name', 'bio', 'profile_picture', 'date_of_birth']
