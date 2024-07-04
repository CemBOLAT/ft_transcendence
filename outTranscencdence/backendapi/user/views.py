from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from management.models import User
from management.serializers import UserSerializer

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse



# Create your views here.
@api_view(['GET'])
def profile(request, userid):
    user = get_object_or_404(User, userID=userid)
    # I want to return the user object as a JSON response and use it in the frontend how do I do that?
    if request.method == 'GET':
        serializer = UserSerializer(user)
        print(serializer.data)
        return Response(serializer.data)
    # print the user object to the console
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def settings(request, userid):
    return HttpResponse(f"Settings for user {userid}")


def addfriend(request, userid):
    return HttpResponse(f"Add friend for user {userid}")

def removefriend(request, userid):
    return HttpResponse(f"Remove friend for user {userid}")

def friends(request, userid):
    return HttpResponse(f"Friends for user {userid}")

def games(request, userid):
    return HttpResponse(f"Games for user {userid}")

def game(request, userid, gameid):
    return HttpResponse(f"Game {gameid} for user {userid}")

def gamestats(request, userid, gameid):
    return HttpResponse(f"Game stats for game {gameid} for user {userid}")
