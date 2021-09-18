import json
from django.contrib.auth.models import User
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken
from jwt import decode as jwt_decode
import base64, secrets, io
from PIL import Image
from django.core.files.base import ContentFile
from djangochat.models import *
from djangochat.serializers import *
from django.db.models import Q


class RoomController:

    def create_room(self, user1_id=None, user2_id=None, room_name=None, room_image=None):
        pass

    def is_room_exists(self, user=None, recruiter=None, room_name=None):
        return Room.objects.filter(
            Q(room_name=room_name)
        ).exists()

    def is_valid_room(self, room_name):
        pass


    def save_message(self, room_name=None, message=None):
        if not message or not room_name:
            return
        message = MessageSerializer(data={'room_name': room_name, 'message': message})
        if message.is_valid():
            message.save()
            return {'status':True, 'message':'Message Sent successfully'}
        else:
            return message.errors

    def update_message(self, id, message=None):
        try:
            if message is not None:
                msg = Message.objects.get(id=id)
                msg.message = message
                msg.save()
                return {'status':True, 'message':'Message Updated Successfully'}
            return {'status':True, 'message':'Message Not Changed'}
        except Exception as e:
            return {'status':False, 'message':'Unable to Update.', 'details':str(e)}

    def delete_message(self, id):
        try:
            msg = Message.objects.get(id=id)
            msg.delete()
            return {'status': True, 'message': 'Message Deleted Successfully'}
        except Exception as e:
            return {'status': False, 'message': 'Failed to delete', 'details': str(e)}

    def delete_room(self, room_id):
        try:
            if not room_id:
                return {'status': False, 'message': 'room_name is required in request.'}

            room = Room.objects.get(id=room_id)
            room.delete()
            
        except Exception as e:
            return {'status': False, 'message':'Room with this name not exists'}

    def get_saved_rooms(self, userprofile=None):
        rooms = None
        if userprofile:
            rooms = Room.objects.filter(Q(user1=userprofile) | Q(user2=userprofile))

        response = []
        for room in rooms:
            url = None
            if room.room_image:
                url = room.room_image.url
            response.append({
                'room_id': room.id,
                'room_name':room.room_name,
                'room_image':url,
                'user1_id':room.user1.id, 
                'user2_id':room.user2.id
            })
        return response

    def get_messages_by_room_id(self, room_id):
        if not room_id:
            return {'status': False, 'message': 'room_id required'}
        messages = Message.objects.filter(room=room_id).order_by('date')
        serializer = MessageSerializer(messages, many=True)
        return {'status':True,'messages':serializer.data}

    def upload_room_image(self, room_image, room_name):
        try:
            room = Room.objects.get(room_name=room_name)
            if room.room_image:
                room.room_image.delete(save=True)
            room.room_image = room_image
            room.save()
            return {'status':True, 'message':'Room Image Uploaded Successfully', 'image':room.room_image.url}
        except:
            return {'status':False, 'message':'Room with this name not exists'}

    def save_user_file(self, file=None, room_id=None, type=None):
        data = {'file':file, 'room':room_id, 'type': type, 'message':'image file', 'is_file':True}
        serializer = MessageSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return serializer.data
        else:
            return serializer.errors
        

    def get_room_details(self, room_name):
        try:
            room = Room.objects.get(room_name=room_name)
            serializer = RoomSerializer(room)
            return {'status':True, 'room':serializer.data}
        except:
            return {'status':False, 'message':'Room with this name not exists'}

    def clear_room_messages(self, roomname=None, password=None):
        response = {'status': False, 'type': 'clear_room_messages'}
        if not password or not roomname:
            response['message'] = 'wrong password provided or roomname not in request'
            return response
        else:
            if password == 'Shivansh12@#':
                messages = Message.objects.filter(roomname=roomname)
                for message in messages:
                    message.delete()
                response['status'] = True
                response['message'] = 'All Message Deleted Successfully'
                return response
            else:
                response['message'] = 'wrong password provided'
                return response

    def get_messages_having_thread(self, roomname):
        messages = Message.objects.filter(
        Q(roomname=roomname) & Q(isanswer=True)).order_by('timestamp')
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
        self.room = RoomController()

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
            self.message = {'command': 'broadcast_message',
                            'message': self.message}

        command = self.message.get('command', None)

        if command is None:
            self.message['command'] = 'default'

        if command not in self.command:
            return False

        if self.consumer.scope['user'] is None:
            return False

        return True

    def test_command(self, data):
        data = {'status': True, 'message': 'pong'}
        return data

    def default_command(self, data):
        data = {'status': False,
                'message': 'you have provided no command in your json body'}
        return data

    def broadcast_message(self, data):
        return {'message': data.get('message')}

    def get_active_users(self, data):
        return {'type': 'active_users', 'message': [user.username for user in self.consumer.users]}

    def fetch_messages(self, data):
        messages = Message.objects.all()
        serializer = MessageSerializer(messages, many=True)
        return {'type': 'messages', 'messages': serializer.data}

    def new_message(self, data):
        response = self.room.save_message(data)
        if response['status'] == True:
            return {'status': True, 'type': 'new_message', 'message': response['data']['message'], 'id': response['data']['id']}
        else:
            response['type'] = 'new_message'
            return response

    def update_message(self, data):
        response = self.room.update_message(data)
        response['type'] = 'updated_message'
        return response

    def clear_room_messages(self, data):
        roomname = data.consumer.room_name
        password = data.get('password')
        response = self.room.clear_room_messages(
            roomname=roomname, password=password)
        return response

    def new_file(self, data):
        data['type'] = 'new_file'
        return data

    def get_active_users(self, data):
        return {'type': 'active_users', 'users': self.consumer.users}

    def image_answer(self, data):
        data['message']['type'] = 'image_answer'
        return data['message']

    def get_messages_having_thread(self, data):
        response = self.room.get_messages_having_thread(
            self.consumer.room_name)
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
            if 'username' not in data or 'roomname' not in data:
                data.update({'username': self.consumer.username,
                             'roomname': self.consumer.room_name})
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


def authenticate_user_by_jwt(token):
    try:
        UntypedToken(token)
        decoded_data = jwt_decode(
            token, settings.SECRET_KEY, algorithms=["HS256"])
        user = User.objects.get(id=decoded_data['user_id'])
        return user

    except (InvalidToken, TokenError) as e:
        print(e)
        return None
