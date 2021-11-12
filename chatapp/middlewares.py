from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
# from django.contrib.auth.models import AnonymousUser
from channels.auth import AuthMiddlewareStack
import urllib.parse
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import authenticate, login
from .models import UserProfile

@database_sync_to_async
def get_user(username, password):
    user = authenticate(username=username, password=password)
    if user is not None:
        user = UserProfile.objects.get(user=user.id)
    else:
        user = AnonymousUser()

    return user

class BasicAuthMiddleware:

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        try:
            params = urllib.parse.parse_qs(scope['query_string'].decode())
            username = params.get('username', None)
            password = params.get('password', None)
            if not username or not password:
                scope['user'] = AnonymousUser()
            else:
                username = username[0]
                password = password[0]
                user = await get_user(username, password)
                scope['user'] = user

        except Exception as e:
            print(e)
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)


BasicAuthMiddlewareStack = lambda inner: BasicAuthMiddleware(AuthMiddlewareStack(inner))
