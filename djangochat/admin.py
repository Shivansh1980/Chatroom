from django.contrib import admin
from .models import Message, MoodleAuthentication
# Register your models here.
admin.site.register(Message)
admin.site.register(MoodleAuthentication)
