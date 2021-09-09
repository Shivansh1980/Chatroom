from django.urls import re_path
from .consumers import *

websocket_urlpatterns = [
    # re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/chat/(?P<room_name>\w+)/$', TempConsumer.as_asgi()),   
]
