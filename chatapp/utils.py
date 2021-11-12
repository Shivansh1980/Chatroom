import json
from django.contrib.auth.models import User
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken
from jwt import decode as jwt_decode
import base64, secrets, io
from PIL import Image
from django.core.files.base import ContentFile
from .models import *
from .serializers import *
from django.db.models import Q

class RoomController:
    def __init__(self, userprofile=None, is_group=False, group_id=None):
        self.userprofile = userprofile
        self.is_group = is_group
        self.group_id = group_id

    def set_is_group(self, is_group):
        self.is_group = is_group

    def set_group_id(self, group_id):
        self.group_id = group_id

    def create_group(self, userlist=[], group_name=None, group_image=None):
        try:
            if not group_name:
                return {'status': False, 'error': 'group_name is required'}

            users = [UserProfile.objects.get(id=id) for id in userlist]
            users.append(self.userprofile)

            if ChatGroup.objects.filter(group_name=group_name).exists():
                return {'status': False, 'error': 'Group With This Name Already Exists'}

            data = {
                'group_name': group_name,
                'group_image': group_image,
                'users': users
            }

            serializer = ChatGroupSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return {'status': True, 'created_group': serializer.data, 'message': 'creation successfull'}
            else:
                return {'status': False, 'error': serializer.errors}

        except Exception as e:
            return {'status': False, 'error': 'some users not exists', 'details': str(e)}

    def add_user_to_group(self, users=None, group_id=None):
        if(not users or len(users) == 0):
            return {'status': False, 'error':"userprofile or list of userprofile is required remove"}
        if(not group_id and not self.group_id):
            return {'status': False, 'error':'group_id is required'}
        if(not group_id):
            group_id = self.group_id

        for i in range(0, len(users)):
            if( type(users[i]) == type(str('')) ):
                if(users[i].startswith('user_')):
                    users[i] = int(users[i][5:])
                else:
                    users[i] = int(users[i])

        userprofiles = UserProfile.objects.filter(id__in = users)
        existing_users = []
        added_users = []
        group = ChatGroup.objects.get(id=group_id)
        for userprofile in userprofiles:
            if userprofile not in group.users.all():
                added_users.append(userprofile.name)
                group.users.add(userprofile)
            else:
                existing_users.append(userprofile.name)
        return {'status': True, 'message': 'Users Added Successfully', 'added_users':added_users, 'existing_users':existing_users}

    def remove_users_from_group(self, users=None, user_id=None, group_id=None):
        if not users and not user_id:
            return {'status': False, 'error': 'users profile or id required'}
        if not users:
            users = [user_id]

        if not group_id:
            return {'status': False, 'error': 'group_id is required'}

        for i in range(0, len(users)):
            if(type(users[i]) == type(str(''))):
                if(users[i].startswith('user_')):
                    users[i] = int(users[i][5:])
                else:
                    users[i] = int(users[i])

        group = ChatGroup.objects.get(id=group_id)
        userprofiles = [UserProfile.objects.get(id=id) for id in users]
        not_existed_users = []
        removed_users = []
        for userprofile in userprofiles:
            if userprofile in group.users.all():
                removed_users.append(userprofile.name)
                group.users.remove(userprofile)
            else:
                not_existed_users.append(userprofile.name)

        return {'status': True, 'message':'Users Removed Successfully', 'not_existed_users': not_existed_users, 'removed_users':removed_users}

    def get_users_by_group_id(self, group_id):
        try:
            userprofiles = ChatGroup.objects.get(id=group_id).users.all()
            serializer = UserProfileSerializer(userprofiles, many=True)
            return {'status': True, 'data':serializer.data}
        except Exception as e:
            return {'status': False, 'error':str(e)}

    def create_room(self, user1_id=None, user2_id=None, room_name=None, room_image=None):
        try:
            user1 = UserProfile.objects.get(id=user1_id)
            user2 = UserProfile.objects.get(id=user2_id)
            data = {
                'user1':user1.id,
                'user2':user2.id,
                'room_name':room_name,
                'image':room_image,
            }
            serializer = RoomSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                all_rooms = Room.objects.all()
                all_rooms = RoomSerializer(all_rooms, many=True)
                return {'status':True,'created_room':serializer.data, 'data':all_rooms.data, 'message':'creation successfull'}
            else:
                return {'status':True, 'error':serializer.errors}
        except:
            return {'status':False, 'error':'User with this id does not exists'}

    def is_room_exists(self, room_id=None, room_name=None, group_id = None, group_name=None, user1_id=None, user2_id=None):
        if self.is_group:
            try:
                return ChatGroup.objects.filter(
                    Q(id=group_id) | Q(group_name=group_name)
                ).exists()
            except:
                return False
        
        else:
            user1 = None
            user2 = None

            try:
                if user1_id and user2_id:
                    user1 = UserProfile.objects.get(id=user1_id)
                    user2 = UserProfile.objects.get(id=user2_id)
                
                return Room.objects.filter(
                    Q(id=room_id) | Q(room_name=room_name) | (Q(user1=user1) & Q(user2=user2))
                ).exists()

            except:
                return False
        

    def save_message(self, room_id=None, group_id=None, message=None, user_id=None):
        if group_id is not None:
            room_id = group_id

        try:
            if not message or not room_id or not user_id:
                return {'status': False, 'message':'message, user and room_id required'}

            if self.is_group:
                if ChatGroup.objects.filter(id=room_id).exists():
                    message = MessageSerializer(data={'group': room_id, 'message': message, 'user_id': user_id})
                    if message.is_valid():
                        obj = message.save()
                        return {'status': True, 'message': message.data, 'id': obj.id}
                    else:
                        print(message.errors)
                        return {'status': False, 'error': message.errors}
                else:
                    return {'status': False, 'error':'Group with this id does not exists'}

            if Room.objects.filter(id=room_id).exists():
                message = MessageSerializer(data={'room': room_id, 'message': message, 'user_id': user_id})
                if message.is_valid():
                    obj = message.save()
                    return {'status': True, 'message': message.data, 'id': obj.id}
                else:
                    print(message.errors)
                    return {'status':False, 'error':message.errors}
            else:
                return {'status':False, 'message':'Room With This Id Does Not Exist'}

        except Exception as e:
            return {'status':False, 'message':str(e)}

    def update_message(self, id, message=None):
        try:
            if message is not None:
                msg = Message.objects.get(id=id)
                msg.message = message
                msg.save()
                return {'status':True, 'message':'Message Updated Successfully'}

            return {'status':True, 'message':'Message Update Cancelled'}

        except Exception as e:
            return {'status':False, 'message':'Unable to Update.', 'details':str(e)}

    def delete_message(self, id):
        try:
            msg = Message.objects.get(id=id)
            msg.delete()
            return {'status': True, 'message': 'Message Deleted Successfully'}
        except Exception as e:
            return {'status': False, 'message': 'Failed to delete', 'details': str(e)}

    def delete_room(self, room_id=None, group_id=None):
        if(not room_id and not group_id):
            return {'status':False, 'message':'room_id or group_id required'}

        try:
            if group_id != None:
                group = ChatGroup.objects.get(id=group_id)
                group.delete()
                return {'status': True, 'message': 'Group Deleted Successfully'}

            else:
                room = Room.objects.get(id=room_id)
                room.delete()
                return {'status': True, 'message': 'Room Deleted Successfully'}

        except Exception as e:
            return {'status': False, 'message':'Room with this id not exists'}

    def get_saved_rooms(self, userprofile=None):
        try:
            rooms = None
            if userprofile:
                rooms = Room.objects.filter(Q(user1__id=userprofile.id) | Q(user2__id=userprofile.id))
                serializer = RoomSerializer(rooms, many=True)
                groups = ChatGroup.objects.filter(Q(users__id=userprofile.id)).distinct()
                groupserializer = ChatGroupSerializer(groups, many=True)
                return {'status': True, 'data': {'rooms_data':serializer.data, 'groups_data':groupserializer.data} }
            else:
                return {'status': False, 'error': 'User does not exists'}
        except Exception as e:
            return {'status':False,'error':str(e)}

    def get_messages_by_group_id(self, group_id):
        if not group_id:
            return {'status': False, 'message':'group_id is required'}

        messages = Message.objects.filter(group=group_id).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return {'status': True, 'messages': serializer.data}


    def get_messages_by_room_id(self, room_id):
        if not room_id:
            return {'status': False, 'message': 'room_id required'}
        messages = Message.objects.filter(room=room_id).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return {'status':True,'messages':serializer.data}
    

    def upload_room_image(self, room_image, room_id):
        try:
            room = Room.objects.get(id=room_id)
            if room.image:
                room.image.delete(save=True)
            room.image = room_image
            room.save()
            return {'status':True, 'message':'Room Image Uploaded Successfully', 'image':room.image.url}
        except:
            return {'status':False, 'message':'Room with this name not exists'}

    def upload_group_image(self, group_image, group_id):
        try:
            group = ChatGroup.objects.get(id=group_id)
            if group.image:
                group.image.delete()
            group.image = group_image
            group.save()
            return {'status': True, 'message':'Group Image Uploaded Successfully'}
        except Exception as e:
            return {'status':False,'message':'Failed To Upload Image', 'error':str(e)}

    def save_user_file(self, file=None, room_id=None, group_id=None, type=None):
        data = {'file':file, 'room':room_id, 'group':group_id, 'type': type, 'message':'image file', 'is_file':True}
        serializer = MessageSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return serializer.data
        else:
            return serializer.errors
        

    def get_room_details(self, room_id=None, group_id=None):
        if not self.is_group:
            try:
                room = Room.objects.get(id=room_id)
                serializer = RoomSerializer(room)
                return {'status':True, 'room':serializer.data}
            except:
                return {'status':False, 'message':'Room with this name not exists'}
        else:
            try:
                group = ChatGroup.objects.get(id=group_id)
                serializer = ChatGroupSerializer(group)
                return {'status':True, 'room':serializer.data}
            except:
                return {'status': False, 'error':'group with this id not exists'}

    def get_room_name_by_id(self, room_id):
        try:
            room = Room.objects.get(id=room_id)
            return {'status':True,'room_name':room.room_name}
        except:
            return {'status':False,'error':'No Such Room Exists'}

    def get_group_name_by_id(self, group_id):
        try:
            group = ChatGroup.objects.get(id=group_id)
            return {'status':True, 'group_name':group.group_name}
        except:
            return {'status': False, 'error':'No Such Group Exists'}

    def clear_room_messages(self, room_id=None, group_id=None, password=None):
        if group_id is not None:
            room_id = group_id
        
        response = {'status': False, 'type': 'clear_room_messages'}
        if not password or not room_id:
            response['message'] = 'wrong password provided or roomname not in request'
            return response
        else:
            if password == 'Shivansh12@#':
                messages = None
                if self.is_group:
                    messages = Message.objects.filter(group=room_id)
                else:
                    messages = Message.objects.filter(room=room_id)
                    
                for message in messages:
                    message.delete()
                response['status'] = True
                response['message'] = 'All Message Deleted Successfully'
                return response
            else:
                response['message'] = 'wrong password provided'
                return response

    def get_messages_having_thread(self, room_id):
        messages = Message.objects.filter(
        Q(roomname=room_id) & Q(isanswer=True)).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return {'status': True, 'messages': serializer.data}

    def update_message(self, data):
        id = data.get('id')
        #id is coming as message_id so we need to get the id from this string
        id = id[8:]
        message = None
        if not id:
            return {'status': False, 'message': 'this message not exists'}
        else:
            message = Message.objects.get(id=id)
            message.message = data.get('updated_message')
            message.isanswer = True
            message.save()
            serializer = MessageSerializer(message)
            return serializer.data

class ChatRequestProcessor:
    command = {}

    def __init__(self, consumer=None, message=None):
        self.consumer = consumer
        self.user = consumer.scope['user']
        self.room = RoomController()
        self.is_group_message = False

        if type(message) == type({}):
            self.message = message

        elif(type(message) == type('')):
            try:
                message = json.loads(message)
                self.message = message
            except:
                self.message = message

    def validate_data(self):
        if type(self.message) == type(''):
            self.message = {'command': 'default','message': self.message}

        command = self.message.get('command', None)

        if command is None:
            self.message['command'] = 'default'

        if command not in self.command:
            return False

        if self.consumer.scope['user'] is None:
            return False

        if self.message.get('group_id') or self.message.get('group'):
            self.is_group_message = True
            self.room.is_group = True

        return True

    def test_command(self, data):
        data = {'status': True, 'message': 'pong'}
        return data

    def default_command(self, data):
        data = {'status': False,'message': 'you have provided no command in your json body'}
        return data

    def broadcast_message(self, data):
        return {'message': data.get('message')}

    def get_active_users(self, data):
        return {'type': 'active_users', 'message': [user.name for user in self.consumer.users]}

    def fetch_messages(self, data):
        if self.is_group_message:
            messages = Message.objects.filter(group__id=data.get('group_id'))
            serializers = MessageSerializer(messages, many=True)
            return {'type':'messages', 'messages':serializers.data}
        else:
            messages = Message.objects.filter(room=self.consumer.room_id)
            serializers = MessageSerializer(messages, many=True)
            return {'type': 'messages', 'messages': serializers.data}

    def new_message(self, data):
        data['room_id'] = self.consumer.room_id
        data['user_id'] = self.user.id
        response = self.room.save_message(
            room_id = data.get('room_id'),
            message = data.get('message'),
            user_id = data.get('user_id')
        )
        if response['status'] == True:
            return {'status': True, 'type': 'new_message', 'data': response['message'], 'id': response['id']}
        else:
            response['type'] = 'new_message'
            return response

    def update_message(self, data):
        response = self.room.update_message(data)
        response['type'] = 'updated_message'
        return response

    def clear_room_messages(self, data):
        room_id = self.consumer.room_id
        password = data.get('password')
        response = self.room.clear_room_messages(
            room_id=room_id, 
            password=password
        )
        return response

    def new_file(self, data):
        data['type'] = 'new_file'
        file_data = get_file_from_data_url(data['dataURL'])
        
        # file = file_data[0]
        # filename = data['filename']

        extension = file_data[1][1]
        data['extension'] = extension
        return data

    def get_active_users(self, data):
        return {'type': 'active_users', 'users': self.consumer.users}

    def image_answer(self, data):
        data['message']['type'] = 'image_answer'
        return data['message']

    def get_messages_having_thread(self, data):
        response = self.room.get_messages_having_thread(self.consumer.room_id)
        response['type'] = 'thread_messages'
        return response


    command = {
        'ping': test_command,
        'default': default_command,
        'fetch_messages': fetch_messages,
        'new_message': new_message,
        'new_file': new_file,
        'update_message': update_message,
        'clear_room_messages': clear_room_messages,
        'get_active_users': get_active_users,
        'image_answer': image_answer,
        'get_messages_having_thread': get_messages_having_thread,
    }

    def process(self):
        if not self.message or not self.consumer:
            return {'message': 'Unable To Process', 'error': 'unable to process request. Have you initialized the RequestProcessor ?'}

        if self.validate_data():
            cmd = self.message.get('command')
            data = self.command[cmd](self, self.message)
            if not self.is_group_message:
                if 'username' not in data or 'roomname' not in data:
                    data.update({
                        'username': self.consumer.username,
                        'room_id': self.consumer.room_id, 
                        'room_name':self.consumer.room_name,
                        'is_group':False
                    })
            else:
                if 'username' not in data or 'roomname' not in data:
                    data.update({
                        'username': self.consumer.username,
                        'room_id': self.consumer.room_id,
                        'room_name': self.consumer.group_name,
                        'is_group': True
                    })
            return {'message': data}
        else:
            response = {
                'status': False, 'message': 'Unable to process request! This command does not exists'}
            return {'message': response}


def get_file_from_data_url(data_url, resize=True, base_width=600):
    _format, _dataurl = data_url.split(';base64,')
    _filename, _extension = secrets.token_hex(20), _format.split('/')[-1]
    file = ContentFile(base64.b64decode(_dataurl), name=f"{_filename}.{_extension}")

    return file, (_filename, _extension)


# def authenticate_user_by_jwt(token):
#     try:
#         UntypedToken(token)
#         decoded_data = jwt_decode(
#             token, settings.SECRET_KEY, algorithms=["HS256"])
#         user = User.objects.get(id=decoded_data['user_id'])
#         return user

#     except (InvalidToken, TokenError) as e:
#         print(e)
#         return None

