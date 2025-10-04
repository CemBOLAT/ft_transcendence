from django.conf import settings
import os
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password , check_password
from django.db import models
from management.models import Game, User, Tournament, FriendRequest, UserBlock
from management.serializers import GameSerializer, UserSerializer, TournamentSerializer, FriendRequestSerializer, UserBlockSerializer
from management.permissions import IsOwnerOrReadOnly
from PIL import Image
from .forms import AvatarUploadForm
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def block_user(request, id):
    try:
        user = User.objects.get(pk=id)
        blocked_user = User.objects.get(pk=request.data['blocked_user_id'])
        
        if UserBlock.objects.filter(blocked_user=blocked_user, blocked_by=user).exists():
            UserBlock.objects.get(blocked_by=user, blocked_user=blocked_user).delete()
            return Response({"status": "User unblocked"}, status=status.HTTP_200_OK)
        else:
            if UserBlock.objects.filter(blocked_user=user, blocked_by=blocked_user).exists():
                return Response({'error': 'User already blocked you'}, status=status.HTTP_400_BAD_REQUEST)
            
            UserBlock.objects.create(blocked_by=user, blocked_user=blocked_user)
            return Response({"status": "User blocked"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def blocked_users(request, id):
    try:
        user = User.objects.get(pk=id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    blocked_users = UserBlock.objects.filter(blocked_by=user)
    serializer = UserBlockSerializer(blocked_users, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsOwnerOrReadOnly])
def delete_user(request, id):
    try:
        avatar_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
        avatar_path = os.path.join(avatar_dir, f"{request.user.username}.jpg")
        if (os.path.exists(avatar_path)):
            os.remove(avatar_path)
        user = User.objects.get(pk=id)
        if not user:
            return Response(status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsOwnerOrReadOnly])
def change_nickname(request, id):
    try:
        user = User.objects.get(pk=id)
        new_nickname = request.data['new_nickname']
        new_is_active_2fa = request.data['is_2FA_enabled']
        #  send errror if nickname is empty
        if not new_nickname:
            return Response({'error': 'Nickname cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
        if ('_' in new_nickname):
            return Response({'error': 'Nickname cannot contain underscore'}, status=status.HTTP_400_BAD_REQUEST)
        user.nickname = new_nickname
        user.is_activate_2fa = new_is_active_2fa
        user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.GET.get('query', '')
    if query:
        current_user = request.user
        friends = current_user.friends.all()
        sent_requests = current_user.sent_requests.all().values_list('to_user', flat=True)
        received_requests = current_user.received_requests.all().values_list('from_user', flat=True)
        excluded_users = [current_user.id] + list(friends.values_list('id', flat=True)) + list(sent_requests) + list(received_requests)

        users = User.objects.filter(username__icontains=query).exclude(id__in=excluded_users)
        user_data = [{'id': user.id, 'username': user.username, 'nickname': user.nickname} for user in users]
        return Response(user_data)
    return Response({'error': 'Query parameter is missing'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request, id):
    try:
        user = User.objects.get(pk=id)
        serializer = UserSerializer(user)
        has_chat_notifications = request.GET.get('chat', None)
        if has_chat_notifications is not None:
            user.chat_notifications = False
            user.save() 
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

## friend requests

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request, id):
    try:
        to_user = User.objects.get(pk=request.data['friend_id'])
        if request.user == to_user:
            return Response({'error': 'You cannot send a friend request to yourself'}, status=status.HTTP_400_BAD_REQUEST)
        if FriendRequest.objects.filter(from_user=request.user, to_user=to_user).exists():
            return Response({'error': 'Friend request already sent'}, status=status.HTTP_400_BAD_REQUEST)
        FriendRequest.objects.create(from_user=request.user, to_user=to_user)
        to_user.friend_notifications = True
        to_user.save()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user_{to_user.username}',
            {
                'type': 'notify_friend_request',
                'message': 'friendHas',
            }
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_friend_request(request, id):
    try:
        friend_request = FriendRequest.objects.get(from_user_id=request.data['friend_id'], to_user=request.user)
        if friend_request.accepted:
            return Response({'error': 'Friend request already accepted'}, status=status.HTTP_400_BAD_REQUEST)
        friend_request.accepted = True
        friend_request.save()
        request.user.friends.add(friend_request.from_user)
        friend_request.from_user.friends.add(request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
    except FriendRequest.DoesNotExist:
        return Response({'error': 'Friend request not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_friend_request(request, id):
    try:
        friend_request = FriendRequest.objects.get(from_user_id=request.data['friend_id'], to_user=request.user)
        friend_request.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except FriendRequest.DoesNotExist:
        return Response({'error': 'Friend request not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friend_requests(request, id):
    try:
        friend_requests = FriendRequest.objects.filter(to_user=request.user, accepted=False)
        serializer = FriendRequestSerializer(friend_requests, many=True)
        user = User.objects.get(pk=id)
        user.friend_notifications = False
        user.save()
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': 'Something went wrong'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friends(request, id):
    try:
        user = User.objects.get(pk=id)
    except:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    friends = user.friends.all()
    serializer = UserSerializer(friends, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_friend(request, id):
    try:
        friend = User.objects.get(pk=request.data['friend_id'])
        if friend in request.user.friends.all():
            request.user.friends.remove(friend)
            friend.friends.remove(request.user)

            # I want to remove the friend request if it exists

            if FriendRequest.objects.filter(from_user=request.user, to_user=friend).exists():
                FriendRequest.objects.filter(from_user=request.user, to_user=friend).delete()
            elif FriendRequest.objects.filter(from_user=friend, to_user=request.user).exists():
                FriendRequest.objects.filter(from_user=friend, to_user=request.user).delete()
            else:
                return Response({'error': 'Friend request not found'}, status=status.HTTP_404_NOT_FOUND)

            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Friend not found'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

## user games
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsOwnerOrReadOnly])
def user_games(request, id):
    try:
        user = User.objects.get(pk=id)
        games = Game.objects.filter(user1=user) | Game.objects.filter(user2=user)
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_game_detail(request, user_id, game_id):
    try:
        game = Game.objects.get(pk=game_id)
        if game.user1.id != int(user_id) and game.user2.id != int(user_id):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = GameSerializer(game)
        return Response(serializer.data)
    except Game.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

## settings

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated, IsOwnerOrReadOnly])
def set_settings(request, id):
    try:
        user = User.objects.get(pk=id)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsOwnerOrReadOnly])
def change_password(request, id):
    print("--- change password ---")
    try:
        user = User.objects.get(pk=id)
        old_password = request.data['old_password']
        password = request.data['new_password']


        # if new password is empty
        if not request.data['new_password']:
            return Response({'error': 'New password cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
        if not check_password(old_password, user.password):
            return Response({'error': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        if (len(password) < 8):
            return Response({'error': 'Password must be at least 8 characters long'}, status=status.HTTP_400_BAD_REQUEST)
        if not any(char.isdigit() for char in password):
            return Response({'error': 'Password must contain at least one digit'}, status=status.HTTP_400_BAD_REQUEST)
        if not any(char.islower() for char in password):
            return Response({'error': 'Password must contain at least one lowercase letter'}, status=status.HTTP_400_BAD_REQUEST)
        if not any(char.isupper() for char in password):
            return Response({'error': 'Password must contain at least one uppercase letter'}, status=status.HTTP_400_BAD_REQUEST) 
        user.password = make_password(password)
        user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsOwnerOrReadOnly])
def upload_avatar(request, id):
    try:
        user = User.objects.get(pk=id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    form = AvatarUploadForm(request.POST, request.FILES)
    if form.is_valid():
        avatar = form.cleaned_data['avatar']
        print(f"---- {avatar.size} ----")
        if avatar.size > settings.FILE_UPLOAD_MAX_MEMORY_SIZE:
            return Response({'error': 'Dosya boyutu çok büyük'}, status=status.HTTP_400_BAD_REQUEST)
        avatar_filename = f"{user.username}.jpg"
        avatar_dir = settings.MEDIA_UPLOAD_IMG_ROOT
        avatar_path = os.path.join(avatar_dir, avatar_filename)
        print(f"--- {avatar_path} ---")
        print(f"--- {avatar_dir} ---")
        print(f"--- {avatar_filename} ---")
        if not os.path.exists(avatar_dir):
            os.makedirs(avatar_dir)
        if os.path.exists(avatar_path):
            os.remove(avatar_path)
        try:
            image = Image.open(avatar)
            if image.format != 'JPEG':
                rgb_image = image.convert('RGB')
                rgb_image.save(avatar_path, format='JPEG')
            else:
                with default_storage.open(avatar_path, 'wb+') as destination:
                    for chunk in avatar.chunks():
                        destination.write(chunk)
        except Exception as e:
            return Response({'error': 'Resim işleme hatası: ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)