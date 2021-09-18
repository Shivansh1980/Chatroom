from django.shortcuts import render
# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import *
api = ChatApi()

class RoomApi(APIView):
    def post(self, request):
        data = RequestParser(request)
        username = data.get('username')
        data = api.get_user_rooms(username=username)
        return Response(data)

    def get(self, request):
        data = RequestParser(request)
        username = data.get('username')
        data = api.get_user_rooms(username=username)
        return Response(data)