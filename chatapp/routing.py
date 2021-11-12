from django.urls import re_path
from .consumers import *

websocket_urlpatterns = [
    re_path(r'chatroom/ws/chat/(?P<room_id>\w+)/$', ChatConsumer.as_asgi()),
    re_path(r'chatroom/ws/group/(?P<group_id>\w+)/$', GroupConsumer.as_asgi()),
]
