import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .utils import ChatRequestProcessor, RoomController
from .models import Message
from django.dispatch import Signal

class ChatConsumer(WebsocketConsumer):
    users = []
    room_controller = RoomController()

    def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = 'chat_%s' % self.room_id
        self.room_name = self.room_controller.get_room_name_by_id(self.room_id)

        if(self.room_name['status'] == True):
            self.room_name = self.room_name['room_name']
        else:
            return
            
        user = self.scope['user']
        self.user = user

        try:
            if user.is_anonymous:
                return
        except:
            pass

        if user not in self.users:
            self.users.append(user)

        self.username = user.user.username

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
