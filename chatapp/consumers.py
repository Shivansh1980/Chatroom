import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .utils import ChatRequestProcessor
from .models import Message
from django.dispatch import Signal

class ChatConsumer(WebsocketConsumer):
    users = []

    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        #I am using TokenAuthMiddleware for accessing user from scope
        user = self.scope['user']

        if user not in self.users:
            self.users.append(user)

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()
    
    def create_event(self, event):
        message = event['message']
        self.send(text_data=json.dumps(message))

    def send_message_to_room(self, message):
        message['type'] = 'create_event'
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, message
        )

    def receive(self, text_data):
        if self.scope['user'] is not None:
            processor = ChatRequestProcessor(consumer=self, message=text_data)
            response = processor.process()
            self.send_message_to_room(response)
        else:
            self.send_message_to_room({
                'message': 'Either you have provided no token in the url or it has been expired.'
            })
            self.scope['user'] = None
        

    def disconnect(self, data):
        try:
            user = self.scope['user']
            if user in self.users:
                self.users.remove(user)
        except:
            pass