import json
from channels.generic.websocket import AsyncWebsocketConsumer
from management.models import User
from asgiref.sync import sync_to_async

class ActiveUserConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user_id = self.scope['query_string'].decode('utf-8').split('=')[1]
        self.user = await sync_to_async(User.objects.get)(id=user_id)

        if self.user.is_authenticated:
            await self.set_user_online(self.user.id)
            await self.accept()

            # Kullanıcıya özel bir grup ekleyin
            await self.channel_layer.group_add(
                f'user_{self.user.username}',
                self.channel_name
            )

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.set_user_offline(self.user.id)

            # Kullanıcıya özel gruptan çıkarın
            await self.channel_layer.group_discard(
                f'user_{self.user.username}',
                self.channel_name
            )

    async def set_user_online(self, user_id):
        user = await sync_to_async(User.objects.get)(id=user_id)
        user.is_online = True
        await sync_to_async(user.save)()

    async def set_user_offline(self, user_id):
        user = await sync_to_async(User.objects.get)(id=user_id)
        user.is_online = False
        await sync_to_async(user.save)()

    async def receive(self, text_data):
        pass

    async def notify_message(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'message': message,
        }))

    async def notify_friend_request(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'message': message,
        }))