from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
# from django.contrib.auth.models import AnonymousUser
from channels.auth import AuthMiddlewareStack
from .utils import authenticate_user_by_jwt
import urllib.parse
from channels.db import database_sync_to_async

@database_sync_to_async
def get_user(token):
    user = authenticate_user_by_jwt(token)
    return user

class TokenAuthMiddleware:

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        try:
            token = urllib.parse.parse_qs(scope['query_string'].decode())['token'][0]
            scope['user'] = await get_user(token)

        except (InvalidToken, TokenError, KeyError) as e:
            scope['user'] = None

        return await self.inner(scope, receive, send)


TokenAuthMiddlewareStack = lambda inner: TokenAuthMiddleware(AuthMiddlewareStack(inner))
