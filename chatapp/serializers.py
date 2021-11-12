from rest_framework import fields, serializers
from .models import *
from django.contrib.auth.models import User

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'room_name', 'image', 'user1', 'user2')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('id', 'pic', 'name', 'user')

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
