from rest_framework import serializers
from .models import *
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'


class UserProfieSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfie
        fields = '__all__'
        
class MoodleAuthentication(serializers.ModelSerializer):
    class Meta:
        model = MoodleAuthentication
        fields = '__all__'
