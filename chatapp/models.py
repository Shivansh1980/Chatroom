from django.db import models

# Create your models here.

# class ChatRoom(models.Model):
#     id          = models.AutoField(primary_key=True)
#     room_name   = models.CharField(unique=True, max_length=200)
#     room_image  = models.ImageField(upload_to=settings.MEDIA_ROOT, null=True, blank=True)
#     user        = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
#     recruiter   = models.ForeignKey(RecruiterProfile, on_delete=models.CASCADE)

# class Message(models.Model):
#     id        = models.AutoField(primary_key=True)
#     room_name = models.CharField(max_length=100)
#     type      = models.CharField(max_length=50, default='text', blank=True, null=True)
#     message   = models.TextField(max_length=1000)
#     file      = models.FileField(upload_to=settings.MEDIA_ROOT, null=True, blank=True)
#     date      = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.type +" -> "+self.message