from rest_framework import fields, serializers
from .models import *
from django.contrib.auth.models import User


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('id', 'pic', 'name', 'user')

class RoomSerializer(serializers.ModelSerializer):
    user1 = UserProfileSerializer(many=False, read_only=True)
    user1_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(),
        source='user',
        write_only=True
    )
    user2 = UserProfileSerializer(many=False, read_only=True)
    user2_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(),
        source='user',
        write_only=True
    )
    class Meta:
        model = Room
        fields = ('id', 'room_name', 'image', 'user1', 'user2', 'user1_id', 'user2_id')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ChatGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatGroup
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(many=False, read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(),
        source='user',
        write_only=True
    )
    class Meta:
        model = Message
        fields = '__all__'
