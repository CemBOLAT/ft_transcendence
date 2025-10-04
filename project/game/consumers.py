import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from urllib.parse import parse_qs
from management.models import User, Game, Message
from django.core.cache import cache

class PongConsumer(AsyncWebsocketConsumer):
    MAX_SCORE = 5

    async def connect(self):
        query_string = self.scope['query_string'].decode('utf-8')
        query_params = parse_qs(query_string)
        self.user_id = query_params.get('user_id', [None])[0]
        self.user = await self.get_user(self.user_id)
        self.room_group_name = None
        self.is_connected = False
        self.is_room_creator = False

        if self.user.is_authenticated:
            endRes = await self.handle_endpoints()

            if not endRes:
                await self.accept()
                await self.send(text_data=json.dumps({
                    'type': 'errormessage',
                    'message': 'The room does not exist.'
                }))
                self.close()
                return

            if self.room_group_name:
                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )
                await self.accept()
                self.is_connected = True
                
                await self.send(text_data=json.dumps({
                    'type': 'Connected',
                    'user_id': self.user.id,
                    'room_creator': self.is_room_creator
                }))

                await self.mark_player_connected(self.room_group_name, self.user_id)

                if not self.is_room_creator:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'join_game',
                            'user_id': self.user.id,
                            'username': self.user.username
                        }
                    )
        
                await self.check_and_start_game()

    async def disconnect(self, close_code):
        if not self.is_connected:
            return
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            players_remaining = await self.mark_player_disconnected(self.room_group_name, self.user_id)
            if players_remaining == 0:
                await self.close_room()
            else:
                await self.notify_player_disconnected()

    async def receive(self, text_data):
        if not self.is_connected:
            return

        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'game_info':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_info',
                    'game_info': data['game_info'],
                    'user_id': data['user_id'],
                }
            )
        elif message_type == 'score':
            if data['who_scored'] == 1:
                self.user1_score += 1
            else:
                self.user2_score += 1
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'score',
                    'who_scored': data['who_scored'],
                    'user_id': data['user_id'],
                    'scores': {'user1Score': self.user1_score, 'user2Score': self.user2_score}
                }
            )
            await self.check_game_end()
        elif message_type == 'game_invite':
            invited_user_id = data['user_id']
            invited_user = await self.get_user(invited_user_id)
            await self.set_chat_message(self.user, invited_user)
            await self.set_chat_notifications(invited_user, True)
            await self.channel_layer.group_send(
                f'user_{invited_user_id}',
                {
                    'type': 'notify_message',
                    'message': 'messageHas',
                }
            )

    async def game_invite(self, event):
        if not self.is_connected:
            return

        message = event['message']
        user_id = event['user_id']

        await self.send(text_data=json.dumps({
            'type': 'game_invite',
            'message': message,
            'user_id': user_id,
        }))

    async def game_info(self, event):
        if not self.is_connected:
            return

        message = event['game_info']
        user_id = event['user_id']

        await self.send(text_data=json.dumps({
            'type': 'game_info',
            'game_info': message,
            'user_id': user_id,
        }))

    async def errormessage(self, event):
        if not self.is_connected:
            return

        message = event['message']

        await self.send(text_data=json.dumps({
            'type': 'errormessage',
            'message': message,
        }))

    async def score(self, event):
        if not self.is_connected:
            return

        who_scored = event['who_scored']
        user_id = event['user_id']
        scores = event['scores']

        await self.send(text_data=json.dumps({
            'type': 'score',
            'who_scored': who_scored,
            'user_id': user_id,
            'scores': scores
        }))

    async def check_game_end(self):
        if self.user1_score >= self.MAX_SCORE or self.user2_score >= self.MAX_SCORE:
            winner_username = self.user.username if self.user1_score >= self.MAX_SCORE else self.second_user.username
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'end_game',
                    'winner': winner_username,
                }
            )
            await self.save_game()
            await self.close_room()

    async def end_game(self, event):
        if not self.is_connected:
            return

        winner = event['winner']
        await self.send(text_data=json.dumps({
            'type': 'end_game',
            'message': f'The game has ended. {winner} wins!',
        }))
        await self.close_game()

    async def close_game(self):
        self.is_connected = False
        await self.close()

    @sync_to_async
    def set_chat_message(self, user, invited_user):
        chat_message =  Message.objects.create(
            sender=user,
            receiver=invited_user,
            content=f'{user.id}',
            is_game_invite=True
        )
        chat_message.save()

    @sync_to_async
    def set_chat_notifications(self, invited_user, status):
        invited_user.chat_notifications = status
        invited_user.save()

    @sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)

    @sync_to_async
    def mark_player_connected(self, room_group_name, user_id):
        players_connected = cache.get(room_group_name, [])
        players_connected.append(user_id)
        cache.set(room_group_name, players_connected)

    @sync_to_async
    def mark_player_disconnected(self, room_group_name, user_id):
        players_connected = cache.get(room_group_name, [])
        if user_id in players_connected:
            players_connected.remove(user_id)
        cache.set(room_group_name, players_connected)
        return len(players_connected)
    
    async def check_and_start_game(self):
        players_connected = cache.get(self.room_group_name, [])
        if len(players_connected) == 2:
            user1 = await self.get_user(players_connected[0])
            user2 = await self.get_user(players_connected[1])
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'start_game',
                    'message': 'The game is starting!',
                    'user1_username': user1.username,
                    'user2_username': user2.username,
                }
            )

    async def start_game(self, event):
        if not self.is_connected:
            return

        user1_username = event['user1_username']
        user2_username = event['user2_username']

        await self.send(text_data=json.dumps({
            'type': 'start_game',
            'message': 'The game has started!',
            'user1_username': user1_username,
            'user2_username': user2_username,
        }))

    async def notify_player_disconnected(self):
        if not self.is_connected:
            return
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_disconnected',
                'message': 'Player has disconnected.',
            }
        )

    async def player_disconnected(self, event):
        if not self.is_connected:
            return

        await self.send(text_data=json.dumps({
            'type': 'player_disconnected',
            'message': event['message'],
        }))
        await self.close_game()

    async def close_game(self):
        self.is_connected = False
        await self.close_room()
        await self.close()

    @sync_to_async
    def close_room(self):
        matches = cache.get('matches', [])
        if self.room_group_name in matches:
            matches.remove(self.room_group_name)
            cache.set('matches', matches)

        private_matches = cache.get('private_matches', [])
        if self.room_group_name in private_matches:
            private_matches.remove(self.room_group_name)
            cache.set('private_matches', private_matches)
        cache.delete(self.room_group_name)

    async def handle_endpoints(self):
        endpoint = self.scope['url_route']['kwargs'].get('endpoint')

        if endpoint == 'findmatch':
            await self.find_match_or_create()
        elif endpoint == 'creatematch':
            await self.create_match()
        elif endpoint == 'joinmatch':
            res = await self.join_match()
            if not res:
                return False
        else:
            self.room_group_name = endpoint
        return True

    @sync_to_async
    def find_match_or_create(self):
        matches = cache.get('matches', [])
        for match in matches:
            if len(cache.get(match, [])) < 2:
                self.room_group_name = match
                return
        # Oda bulunamazsa, yeni bir oda oluştur
        new_match = f'match-{self.user.id}-{len(matches) + 1}'
        matches.append(new_match)
        cache.set('matches', matches)
        self.user1_score = 0
        self.user2_score = 0
        self.room_group_name = new_match
        self.is_room_creator = True

    @sync_to_async
    def create_match(self):
        matches = cache.get('private_matches', [])
        new_match = f'match-{self.user.id}'
        if new_match in matches:
            matches.remove(new_match)
        matches.append(new_match)
        cache.set('private_matches', matches)
        self.user1_score = 0
        self.user2_score = 0
        self.room_group_name = new_match
        self.is_room_creator = True
    
    @sync_to_async
    def join_match(self):
        matches = cache.get('private_matches', [])
        query_string = self.scope['query_string'].decode('utf-8')
        query_params = parse_qs(query_string)
        room_owner_id = query_params.get('room_owner_id', [None])[0]
        if f'match-{room_owner_id}' not in matches:
            return False
        self.room_group_name = f'match-{room_owner_id}'
        return True

    @sync_to_async
    def save_game(self):
        game = Game.objects.create(user1=self.user, user2=self.second_user, user1Score=self.user1_score, user2Score=self.user2_score)
        game.save()
        if (self.user1_score >= self.MAX_SCORE):
            self.user.win += 1
            self.user.save()
            self.second_user.lose += 1
            self.second_user.save()
        else:
            self.user.lose += 1
            self.user.save()
            self.second_user.win += 1
            self.second_user.save()

    async def join_game(self, event):
        if not self.is_connected:
            return
        self.second_user_id = event['user_id']
        self.second_user = await self.get_user(self.second_user_id)
