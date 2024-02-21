import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from urllib.parse import parse_qs
from .models import Message, TextMessage, Image, Thread, ContentType
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from channels.exceptions import StopConsumer
from users.models import CustomUser

class PanelConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_params = parse_qs(self.scope['query_string'].decode())
        token = query_params.get('token', [None])[0]
        token = str(token).replace('"','')
        try:
            token_object = await database_sync_to_async(Token.objects.get)(key=token)
            user = await database_sync_to_async(lambda: token_object.user)()
            
            if user is None:
                await self.close()
                return
        except Token.DoesNotExist:
            await self.close()
            return

        self.scope['user'] = user
        await self.accept()

        # Add the user's channel to the group for receiving message notifications
        user_channel = f'user_{user.username}'
        await self.channel_layer.group_add(
            user_channel,
            self.channel_name
        )

    async def disconnect(self, close_code):
        user_channel = f'user_{self.scope["user"].username}'
        await self.channel_layer.group_discard(
            user_channel,
            self.channel_name
        )

    async def receive(self, text_data):
        print(text_data)

    async def chat_message(self, event):
        message_text = event['message']
        sender_username = event['sender_username']
        time = event['time']
        id = event['id']
        await self.send(text_data=json.dumps({
            'id': id,
            'sender_username': sender_username,
            'time':time,
            'content_object': {'text': message_text},
        }))

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_params = parse_qs(self.scope['query_string'].decode())
        token = query_params.get('token', [None])[0]
        try:
            token_object = await database_sync_to_async(Token.objects.get)(key=token)
            user = await database_sync_to_async(lambda: token_object.user)()
            if user is None:
                await self.disconnect(4003)
                return
        except Token.DoesNotExist:
            await self.disconnect(4003)
            return

        self.scope['user'] = user
        username = user.username
        self.user_channel = f'user_{username}'
        self.other_username = self.scope['url_route']['kwargs']['username']
        other_user = await sync_to_async(CustomUser.objects.get)(username=self.other_username)
        self.thread_obj = await sync_to_async(Thread.objects.get_personal_thread)(self.scope['user'], other_user)
        if self.thread_obj:
            try:
                other_user = await sync_to_async(CustomUser.objects.get)(username=self.other_username)

                # Add both user channels to their respective groups
                await self.channel_layer.group_add(
                    self.user_channel,
                    self.channel_name
                )
                other_user_channel = f'user_{self.other_username}'
                await self.channel_layer.group_add(
                    other_user_channel,
                    self.channel_name
                )

                await self.accept()
            except:
                await self.disconnect(4003)
        else:
            await self.accept()
            await self.disconnect(4003)
        
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.user_channel,
            self.channel_name
        )
        other_user_channel = f'user_{self.other_username}'
        await self.channel_layer.group_discard(
            other_user_channel,
            self.channel_name
        )
        
        # Close the WebSocket connection
        await self.close(code=close_code) 

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_text = text_data_json['message']
        channel_layer = get_channel_layer()
        user_channel = f'user_{self.other_username}'
        if message_text != "":
            # Send the message to the other user's channel group with the correct sender ID
            text = await sync_to_async(TextMessage.objects.create)(text=message_text)
            content_type = await sync_to_async(ContentType.objects.get_for_model)(TextMessage)
            message = await sync_to_async(Message.objects.create)(
                thread=self.thread_obj,
                sender=self.scope['user'],
                content_type=content_type,
                object_id=text.id
            )
            await channel_layer.group_send(
                user_channel,
                {
                    'type': 'chat_message',
                    'id':message.id,
                    'message': message_text,
                    'time':message.created_at.isoformat(),
                    'sender_username': self.scope['user'].username,
                }
            )

    async def chat_message(self, event):
        message_text = event['message']
        sender_username = event['sender_username']
        id = event['id']
        time = event['time']
        await self.send(text_data=json.dumps({
            'id': id,
            'sender_username': sender_username,
            'time':time,
            'content_object': {'text': message_text},
        }))
