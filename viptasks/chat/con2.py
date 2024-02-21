from channels.generic.websocket import AsyncWebsocketConsumer,WebsocketConsumer
import json
from django.contrib.auth.models import User
from .models import Thread,Message,MessageType,Images
from asgiref.sync import sync_to_async,async_to_sync


class ChatServer(WebsocketConsumer):
    def connect(self):
        self.room_name = "server"
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        message = str(message).split(":")
        sender = message[0].strip('[()]')
        message = message[1]
        if message != "":
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': sender
                }
            )
    def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        # Send message to WebSocket
        if message != "":
            self.send(text_data=json.dumps({
                'message': message,
                'sender':sender
            }))
from rest_framework.authtoken.models import Token
from urllib.parse import parse_qs
from django.contrib.auth import get_user_model

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.readed = False
        query_params = parse_qs(self.scope['query_string'].decode())
        token = query_params.get('token', [None])[0]
        UserModel = get_user_model()
        if token is None:
            await self.close()
        else:
            token = str(token).split()[1]
            token_object = await sync_to_async(Token.objects.get)(key=token)
            user = await sync_to_async(lambda: token_object.user)()
            if user is None:
                await self.close()
        self.scope['user'] = user
        me = self.scope['user']
        other_username = self.scope['url_route']['kwargs']['username']
        other_user =await sync_to_async(User.objects.get)(username=other_username)
        self.thread_obj =await sync_to_async(Thread.objects.get_or_create_personal_thread)(me,other_user)
        self.room_name = f'{self.thread_obj.id}_service'
        # self.room_name = self.scope['url_route']['kwargs']['username']
        self.room_group_name = self.room_name
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        self.type = text_data_json['message_type']
        message = str(message).split(":")
        sender = message[0].strip('[()]')
        message = message[1]
        if self.type != "writing" and message != "":
            if self.scope['user'].username == sender:
                if self.type == "txt":
                    message_type = await sync_to_async(MessageType.objects.create)(type = "txt",text = message)
                elif self.type == "img":
                    image = await sync_to_async(Images.objects.get)(id = message)

                    if image.image.url is not None:
                        message = image.image.url
                    else:
                        message = None
                    message_type = await sync_to_async(MessageType.objects.create)(type = "img",image = image)
                elif self.type == "stkr":
                    message_type = await sync_to_async(MessageType.objects.create)(type = "stkr",sticker = message)
                    
                await sync_to_async(Message.objects.create)(sender=self.scope['user'], thread=self.thread_obj, message_type = message_type)
        if message != "":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': sender,
                    'message_type': self.type
                }
            )

    async def chat_message(self, event):
        clear = False
        message = event['message']
        print(message)
        sender = event['sender']
        type = event['message_type']
        if type != "writing" and self.readed:
            await sync_to_async(Message.objects.update)(readed = True)
        if type != "writing" and self.readed != True:
            self.readed = True
        # Send message to WebSocket
        if message != "" and type == "writing":
            await self.send(text_data=json.dumps({
                'sender':sender,
                'message_type': type
            }))
        elif message != "" and type == "txt":
            await self.send(text_data=json.dumps({
                'message':message,
                'sender':sender,
                'message_type': type
            }))
        elif message == "" and type == "writing":
            await self.send(text_data=json.dumps({
                'message':message,
                'sender':sender,
                'message_type': type
            }))
        elif message != "" and type == "img":
            await self.send(text_data=json.dumps({
                'message':message,
                'sender':sender,
                'message_type': type
            }))