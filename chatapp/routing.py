from django.urls import re_path
from .consumers import *
from djangochat.consumers import TempConsumer
websocket_urlpatterns = [
    re_path(r'chatroom/ws/chat/(?P<room_name>\w+)/$', TempConsumer.as_asgi()),
    re_path(r'ws/chat/(?P<room_name>\w+)/$', ChatConsumer.as_asgi()),
]
