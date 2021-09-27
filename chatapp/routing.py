from django.urls import re_path
from .consumers import *

websocket_urlpatterns = [
    re_path(r'chatroom/ws/chat/(?P<room_id>\w+)/$', ChatConsumer.as_asgi()),
]
