from rest_framework import viewsets
from .models import Message
from .serializers import MessageSerializer
from rest_framework.authentication import BasicAuthentication

class MessageViewset(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer