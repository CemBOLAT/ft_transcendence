from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def login(request):
    return HttpResponse("Login")

def signup(request):
    return HttpResponse("Signup")

def room(request, roomid):
    return HttpResponse("Room " + roomid)

def chat(request, roomid):
    return HttpResponse("Chat " + roomid)

def leaderboard(request, tournamentid):
    return HttpResponse("Leaderboard " + tournamentid)