from django.urls import path
from . import views


urlpatterns = [
    path('login', views.login),
    path('signup', views.signup),
    path('game/<roomid>', views.room),
    path('chat/<roomid>', views.chat),
    path('leaderboard/<tournamentid>', views.leaderboard),
]
