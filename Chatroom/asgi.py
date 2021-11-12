"""
ASGI config for Chatroom project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

# import os

# from django.core.asgi import get_asgi_application
# from channels.routing import get_default_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Chatroom.settings')

# application = get_asgi_application()

import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
# from channels.auth import AuthMiddlewareStack
import chatapp.routing
from chatapp.middlewares import BasicAuthMiddlewareStack


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Chatroom.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": BasicAuthMiddlewareStack(
        URLRouter(
            chatapp.routing.websocket_urlpatterns
        )
    ),
})
