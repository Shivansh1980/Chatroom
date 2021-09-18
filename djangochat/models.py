from django.db import models
from django.contrib.auth import get_user_model
from Chatroom import settings
from django.contrib.auth.models import User
# Create your models here.


class UserProfie(models.Model):
    id = models.AutoField(primary_key=True)
    pic = models.ImageField(upload_to='', blank=True, null=True)
    name = models.CharField(max_length=100)
    user = models.OneToOneField(User, on_delete=models.CASCADE)


class Room(models.Model):
    id        = models.AutoField(primary_key=True)
    room_name = models.CharField(max_length=100)
    image     = models.ImageField(upload_to='', blank=True, null=True)
    user1     = models.ForeignKey(UserProfie, on_delete=models.CASCADE, related_name="user1")
    user2     = models.ForeignKey(UserProfie, on_delete=models.CASCADE, related_name="user2")

class Message(models.Model):
    id=models.AutoField(primary_key=True)
    username  = models.CharField(max_length=25)
    message   = models.TextField()
    file      = models.FileField(upload_to='', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    room      = models.ForeignKey(Room, on_delete=models.CASCADE)
    isanswer  = models.BooleanField(default=False)
    isfile    = models.BooleanField(default=False)
    type      = models.CharField(max_length=40, default='text', blank=True, null=True)

    def last_40_messages():
        return Message.objects.order_by('timestamp').all()[:40]

class MoodleAuthentication(models.Model):
    name = models.CharField(max_length=50)
    username = models.CharField(unique=True, max_length=40)
    password = models.CharField(max_length=50)

    def __str__(self):
        return self.name
