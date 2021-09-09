import json
from .models import Message
from .serializers import MessageSerializer
from django.db.models import Q

class QuestionHelper:
    def compare_questions(self, questions, q):
        for question in questions:
            if (question.content == q):
                return True
        return False

    def to_json(data):
        return json.dumps(data)

class Room:
    def save_message(self, data):
        serializer = MessageSerializer(data=data)
        if(serializer.is_valid()):
            serializer.save()
            return {'status':True, 'data':serializer.data}
        else:
            return {'status':False, 'data':serializer.errors}
    
    def update_message(self, data):
        id = data.get('id')
        #id is coming as message_id so we need to get the id from this string
        id = id[8:]
        message = None
        if not id:
            return {'status':False, 'message':'this message not exists'}
        else:
            message = Message.objects.get(id=id)
            message.message = data.get('updated_message')
            message.isanswer = True
            message.save()
            serializer = MessageSerializer(message)
            return serializer.data

    def get_messages_having_thread(self, roomname):
        messages = Message.objects.filter( Q(roomname=roomname) & Q(isanswer=True)).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return {'status':True, 'messages':serializer.data}

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


        
class ChatRequestProcessor:
    command = {}

    def __init__(self, consumer=None, message=None):
        self.consumer = consumer
        self.room = Room()

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
            self.message = {'command': 'broadcast_message', 'message': self.message}

        command = self.message.get('command', None)

        if command is None:
            self.message['command'] = 'default'

        if command not in self.command:
            return False

        if self.consumer.scope['user'] is None:
            return False

        return True

    def test_command(self, data):
        data = {'status':True,'message': 'pong'}
        return data

    def default_command(self, data):
        data = {'status':False,'message': 'you have provided no command in your json body'}
        return data

    def broadcast_message(self, data):
        return {'message': data.get('message')}

    def get_active_users(self, data):
        return {'type':'active_users','message': [user.username for user in self.consumer.users]}

    def fetch_messages(self, data):
        messages = Message.objects.all()
        serializer = MessageSerializer(messages, many=True)
        return {'type':'messages', 'messages':serializer.data}
    
    def new_message(self, data):
        response = self.room.save_message(data)
        if response['status'] == True:
            return {'status':True, 'type':'new_message', 'message':response['data']['message'], 'id':response['data']['id']}
        else:
            response['type'] = 'new_message'
            return response

    def update_message(self, data):
        response = self.room.update_message(data)
        response['type'] = 'updated_message'
        return response

    def clear_room_messages(self,data):
        roomname = data.get('roomname')
        password = data.get('password')
        response = self.room.clear_room_messages(roomname=roomname, password=password)
        return response

    def new_file(self, data):
        data['type'] = 'new_file'
        return data

    def get_active_users(self, data):
        return {'type':'active_users','users':self.consumer.users}

    def image_answer(self, data):
        data['message']['type'] = 'image_answer'
        return data['message']
    
    def get_messages_having_thread(self, data):
        response = self.room.get_messages_having_thread(self.consumer.room_name)
        response['type'] = 'thread_messages'
        return response

    command = {
        'ping': test_command,
        'default': default_command,
        'fetch_messages':fetch_messages,
        'new_message': new_message,
        'new_file':new_file,
        'update_message':update_message,
        'clear_room_messages':clear_room_messages,
        'get_active_users': get_active_users,
        'image_answer':image_answer,
        'get_messages_having_thread': get_messages_having_thread,
    }

    def process(self):
        if not self.message or not self.consumer:
            return {'message':'Unable To Process' ,'error': 'unable to process request. Have you initialized the RequestProcessor ?'}

        if self.validate_data():
            cmd = self.message.get('command')
            data = self.command[cmd](self, self.message)
            if 'username' not in data or 'roomname' not in data:
                data.update({'username':self.consumer.username, 'roomname':self.consumer.room_name})
            return {'message': data}
        else:
            response = {
                'status': False, 'message': 'Unable to process request! This command does not exists'}
            return {'message': response}
