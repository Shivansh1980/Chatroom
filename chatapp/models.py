from django.db import models
from django.contrib.auth.models import User
from Chatroom import settings

class UserProfile(models.Model):
    id   = models.AutoField(primary_key=True)
    pic  = models.ImageField(blank=True, null=True)
    name = models.CharField(max_length=100)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Room(models.Model):
    id = models.AutoField(primary_key=True)
    room_name = models.CharField(max_length=100)
    image = models.ImageField(blank=True, null=True)
    user1 = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="user1")
    user2 = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="user2")

    def __str__(self):
        return str(self.id) + '->' + str(self.room_name)


class Message(models.Model):
    id       = models.AutoField(primary_key=True)
    user     = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    message  = models.TextField()
    file     = models.FileField(blank=True, null=True)
    timestamp= models.DateTimeField(auto_now_add=True)
    room     = models.ForeignKey(Room, on_delete=models.CASCADE)
    isanswer = models.BooleanField(default=False)
    isfile   = models.BooleanField(default=False)
    type     = models.CharField(max_length=40, default='text', blank=True, null=True)

    def __str__(self):
        return self.user.name + ' -> ' + self.message

    def last_40_messages():
        return Message.objects.order_by('timestamp').all()[:40]

class ChatGroup(models.Model):
    id = models.AutoField(primary_key=True)
    group_name = models.CharField(max_length=50)
    users = models.ManyToManyField(UserProfile, related_name='chatgroup')

class MoodleAuthentication(models.Model):
    name = models.CharField(max_length=50)
    username = models.CharField(unique=True, max_length=40)
    password = models.CharField(max_length=50)

    def __str__(self):
        return self.name
