from django.urls import path
from django.conf.urls import include
from django.conf.urls.static import static
from . import views
from Chatroom import settings


urlpatterns = [
    path('', views.index, name='index'),
    path('chat/', views.index, name='index'),
    path('get_messages/', views.get_messages, name='getmessages'),
    # path('<str:room_name>/', views.room, name='room'),
    path('get/',views.upload_moodle_username, name='upload_moodle_username')
]
