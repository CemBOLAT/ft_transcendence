import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from management.models import User, Message, UserBlock

user_counts = {}

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['query_string'].decode('utf-8').split('user_id=')[1]
        self.user = await self.get_user(self.user_id)
        self.other_username = self.scope['url_route']['kwargs']['username']
        self.room_name = await self.get_room_name(self.user.username, self.other_username)
        self.room_group_name = f'chat_{self.room_name}'

        if self.user.is_authenticated:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            if self.room_group_name not in user_counts:
                user_counts[self.room_group_name] = 0
            user_counts[self.room_group_name] += 1

            await self.accept()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

            if self.room_group_name in user_counts:
                user_counts[self.room_group_name] -= 1
                if user_counts[self.room_group_name] == 0:
                    del user_counts[self.room_group_name]

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        
        is_blocked = await self.is_blocked_user(self.other_username)
        if (is_blocked):
            await self.send(text_data=json.dumps({
                'message': 'blocked',
                'user_id': self.user.id,
                'username': self.user.username,
            }))
            return

        await self.save_message(self.user, self.other_username, message)

        if user_counts.get(self.room_group_name, 0) < 2:
            await self.channel_layer.group_send(
                f'user_{self.other_username}',
                {
                    'type': 'notify_message',
                    'message': 'messageHas',
                }
            )

            await self.set_chat_notifications(self.other_username, True)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'user_id': self.user.id,
                'username': self.user.username,
            }
        )

    @sync_to_async
    def is_blocked_user(self, username):
        other_user = User.objects.get(username=username)
        if (UserBlock.objects.filter(blocked_user=other_user, blocked_by=self.user).exists()):
            return True
        if (UserBlock.objects.filter(blocked_user=self.user, blocked_by=other_user).exists()):
            return True
        return False

    async def chat_message(self, event):
        message = event['message']
        user_id = event['user_id']
        username = event['username']

        await self.send(text_data=json.dumps({
            'message': message,
            'user_id': user_id,
            'username': username,
        }))

    @sync_to_async
    def get_room_name(self, username1, username2):
        return f'{min(username1, username2)}_{max(username1, username2)}'

    @sync_to_async
    def save_message(self, sender, receiver_username, message):
        receiver = User.objects.get(username=receiver_username)
        Message.objects.create(sender=sender, receiver=receiver, content=message)

    @sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)

    @sync_to_async
    def set_chat_notifications(self, username, status):
        user = User.objects.get(username=username)
        user.chat_notifications = status
        user.save()

    @sync_to_async
    def set_friend_request_notifications(self, username, status):
        user = User.objects.get(username=username)
        user.friend_request_notifications = status
        user.save()
    