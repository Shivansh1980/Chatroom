from django.urls import path, include
from .views import *

urlpatterns = [
    path('<str:command>/', ChatApi.as_view(), name='chatapi')
]
