from rest_framework.authentication import BasicAuthentication
from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import BasicAuthentication
from rest_framework.response import Response
from .utils import *
from .serializers import *
from api.utils import *
from .models import *
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view

class Account:
    def get_user_profile(self, user=None, id=None):
        try:
            if user:
                profile = UserProfile.objects.get(user=user.id)
                return profile
            if id:
                profile = UserProfile.objects.get(id=id)
                return profile
        except:
            return None

    def search_user(self, username=None):
        users = UserProfile.objects.filter(user__username__icontains=username)
        serializers = UserProfileSerializer(users, many=True)
        return {'status':True, 'data':serializers.data}

    def is_anonymous_user(self, user):
        try:
            return user.is_anonymous
        except:
            return False

    def update_profile(self, id=None, profile=None, new_name=None, pic=None):
        try:
            user = None
            if(id):
                user = UserProfile.objects.get(id=id)
            if(profile):
                user = profile

            if(new_name):
                user.name = new_name

            if(pic):
                if(user.pic):
                    user.pic.delete(save=True)
                user.pic = pic
            user.save()
            serializer = UserProfileSerializer(user)
            print(serializer.data)
            return {'status': True, 'message':'profile updated successfully', 'user':serializer.data}
        except Exception as e:
            return {'status':False, 'error':str(e)}



            

account = Account()

class ChatApi(APIView):
    authentication_classes = [BasicAuthentication]
    authentication_permissions = [IsAuthenticated]

    def post(self, request, command=None):
        data = RequestParser(request)


        if command is None:
            Response({'status':False,'error':'command is required in body or form-data'})

        room_controller = RoomController()
        user = request.user

        try:
            if user.is_anonymous:
                return Response({'status':False,'error':'User not authenticated or not exists, Are You Sending Auth Header?'})
        except:
            pass

        userprofile = account.get_user_profile(user=user)

        if command == 'create_room':
            try:
                data['user1_id'] = userprofile.id

                if not data.exists('user2_id'):
                    return Response({'status':False,'error':'user2_id is required'})

                if(data.compare('user1_id', 'user2_id')):
                    return Response({'status':False,'error':'Cannot create room for user with same id'})

                if room_controller.is_room_exists(user1_id=data.get('user1_id'), user2_id=data.get('user2_id')):
                    return Response({'status':False,'error':'Room already exists'})


                response = room_controller.create_room(
                    user1_id   = data.get('user1_id'),
                    user2_id   = data.get('user2_id'),
                    room_name  = data.get('room_name'),
                    room_image = data.get_file('room_image'),
                )
                return Response(response)

            except Exception as e:
                return Response({'status':False,'error':str(e)})

        elif command == 'create_group':
            user_list = data.get('user_list')
            if(user_list is None or len(user_list) == 0):
                user_list = [userprofile.id]
            response = room_controller.create_group(userlist=user_list, group_name=data.get('group_name'), group_image=data.get_file('group_image'))
            return Response(response)

        elif command == "get_users_by_group_id":
            group_id = data.get('group_id')
            return Response(room_controller.get_users_by_group_id(group_id=group_id))

        elif command == 'add_users_to_group':
            users = data.get('users')
            group_id = data.get('group_id')
            return Response(room_controller.add_user_to_group(users=users, group_id=group_id))

        elif command == 'remove_users_from_group':
            users = data.get('users')
            group_id = data.get('group_id')
            return Response(room_controller.remove_users_from_group(users=users, group_id=group_id))

        elif command == 'get_saved_rooms':
            response = room_controller.get_saved_rooms(userprofile=userprofile)
            return Response(response)

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
        
        elif command == 'get_users':
            userprofiles = UserProfile.objects.all()
            serializer = UserProfileSerializer(userprofiles, many=True)
            return Response({'status': True, 'data': serializer.data})


@api_view(['POST'])
def search_user(request):
    data = RequestParser(request)
    response = account.search_user(username=data.get('username'))
    return Response(response)

class UserApi(APIView):
    def post(self, request, slug=None):
        try:
            account = Account()
            data = RequestParser(request)

            if(slug == 'signup'):
                if not data.exists('username') or not data.exists('password'):
                    return Response({'status': False, 'error': 'username and password required'})

                data = data.get_dict()
                user = User.objects.create_user(username=data.get('username'), password=data.get('password'))
                user.save()
                data['user'] = user.id
                data['name'] = user.username

                serializer = UserProfileSerializer(data=data)
                if serializer.is_valid():
                    serializer.save()
                    if user is not None or not account.is_anonymous_user(user):
                        return Response({'status': True, 'data': serializer.data})
                    else:
                        return Response({'status': False, 'error':'unable to authenticate'})
                else:
                    user.delete()
                    return Response(serializer.errors)

            elif (slug == 'login'):
                if not data.exists('username') or not data.exists('password'):
                    return Response({'status': False, 'error': 'username and password required'})

                username = data.get('username')
                password = data.get('password')
                user = authenticate(username=username, password=password)
                if not user or account.is_anonymous_user(user):
                    return Response({'status':False, 'error':'Wrong username or password'})
                else:
                    login(request, user)
                    request.session['username'] = username
                    request.session['password'] = password
                    request.session.modified = True
                    profile = account.get_user_profile(user=user)
                    serializer = UserProfileSerializer(profile)
                    return Response({'status':True, 'message':'LoggedIn Successfully','data':serializer.data})

            elif (slug == 'trylogin'):
                try:
                    username = request.session['username']
                    password = request.session['password']
                    return {'status':True, 'message':'Logged in Successfully'}
                except Exception as e:
                    return Response({'status':False, 'error':'User Session Expired or Deleted', 'details':str(e)})

            elif (slug == 'logout'):
                logout(request)
                return Response({'status':True, 'message':'Logged Out Successfully'})

            elif slug == 'updateprofile':
                try:
                    request.user.is_anonymous
                except:
                    return Response({'status':False, 'error':'anonymous users cannot update there profile'})
                if(request.user and request.user.is_authenticated):
                    profile = account.get_user_profile(user=request.user)
                    newname = data.get('newname')
                    pic = data.get_file('pic')
                    response = account.update_profile(profile=profile, new_name=newname, pic=pic)
                    return Response({'status':True, 'data':response})
            else:
                return Response({'status':False, 'error':'Please Send Login or SignUp in Command'})


        except Exception as e:
            return Response({'status': False, 'error':str(e)})

    def get(self, request, slug=None):
        if request.user.is_authenticated:
            account = Account()
            user = account.get_user_profile(user=request.user)
            if user:
                serializer = UserProfileSerializer(user)
                return Response(serializer.data)
            else:
                return Response({'status': False, 'message':'user not exists'})
        else:
            return Response({'status':False, 'error':'User Not Authenticated'})
