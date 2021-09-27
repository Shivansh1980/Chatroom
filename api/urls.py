from django.urls import path
from django.conf.urls import include
from chatapp.views import *
from rest_framework.routers import DefaultRouter

urlpatterns = [
    path('chat/', include('chatapp.urls')),
]
