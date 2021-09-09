from rest_framework import serializers
from .models import Message, MoodleAuthentication
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
        
class MoodleAuthentication(serializers.ModelSerializer):
    class Meta:
        model = MoodleAuthentication
        fields = '__all__'
