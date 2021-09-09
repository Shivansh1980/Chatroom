import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Message
from .utils import *
import urllib

class TempConsumer(WebsocketConsumer):
    users = []
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        self.params = urllib.parse.parse_qs(self.scope['query_string'].decode('utf-8'))
        self.username = self.params['username'][0]

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

        if len(self.users) > 0:
            for user in self.users:
                if(user['username'] == self.username and user['roomname'] == self.room_name):
                    return
        self.users.append({'username': self.username,'roomname': self.room_name})
        self.send_message_to_room({
            'roomname': self.room_name, 
            'username': self.username, 
            'message': {'status': True, 'users': self.users}
        })

    def create_event(self, event):
        message = event['message']
        self.send(text_data=json.dumps(message))

    def send_message_to_room(self, message):
        message['type'] = 'create_event'
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, message
        )

    def receive(self, text_data):
        processor = ChatRequestProcessor(consumer=self, message=text_data)
        response = processor.process()
        self.send_message_to_room(response)

    def disconnect(self, data):
        self.close()
        new_users = []
        if(len(self.users)) > 0:
            for user in self.users:
                if(user['username'] != self.username):
                    new_users.append(user)
                else:
                    continue
            self.users = new_users
            self.send_message_to_room({
                'roomname': self.room_name,
                'username': self.username,
                'message': {'status': True, 'users': self.users}
            })

