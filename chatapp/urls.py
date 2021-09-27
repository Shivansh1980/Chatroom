from django.urls import path, include
from .views import *

urlpatterns = [
    path('user/', UserApi.as_view(), name='userapi'),
    path('user/<str:slug>/', UserApi.as_view(), name='userapi'),
    path('command/<str:command>/', ChatApi.as_view(), name='chatapi'),
]
