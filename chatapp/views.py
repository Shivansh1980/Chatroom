from django.shortcuts import render
# Create your views here.
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .utils import RoomController
from .serializers import *
from api.utils import *

class ChatApi(APIView):
    authentication_classes = [JWTAuthentication]
    permissions = [IsAuthenticated]

    def post(self, request, command=None):

        data = RequestParser(request)

        if command is None:
            Response({'status':False,'error':'command is required in body or form-data'})

        room_controller = RoomController()

        user = request.user
        # profile_data = get_user_profile(user)

        if command == 'create_room':
            response = room_controller.create_room(
                user_id         = data.get('user_id'),
                user_contact    = data.get('user_contact'),
                recruiter_id    = data.get('recruiter_id'),
                recruiter_email = data.get('recruiter_email'),
                room_name       = data.get('room_name'),
                room_image      = data.get_file('room_image'),
            )
            return Response(response)

        elif command == 'get_saved_rooms':
            pass

        elif command == 'delete_room':
            response = room_controller.delete_room(data.get('room_id'))
            return Response(response)

        elif command == 'upload_room_image':
            try:
                if not data.is_file_exists('room_image'):
                    return Response({'status':False, 'message':'room_image field is required in files'})

                room_image = data.get_file('room_image')
                room_name  = data.get('room_name')
                response   = room_controller.upload_room_image(room_image, room_name)
                return Response(response)

            except Exception as e:
                return Response({'status':False, 'message':str(e)})
            
