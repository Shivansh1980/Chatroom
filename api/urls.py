from django.urls import path
from django.conf.urls import include
from .views import *
from rest_framework.routers import DefaultRouter
from djangochat.viewsets import MessageViewset

router = DefaultRouter()
router.register('messageapi', MessageViewset, basename='messageapi')

urlpatterns = [
    path('rooms/', RoomApi.as_view()),
    path('messages/', include(router.urls))
]
