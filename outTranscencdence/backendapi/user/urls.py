from django.urls import path
from . import views

urlpatterns = [
    path('<userid>', views.profile),
    path('<userid>/profile', views.profile),
    path('<userid>/settings', views.settings),
    path('<userid>/addfriend', views.addfriend),
    path('<userid>/removefriend', views.removefriend),
    path('<userid>/friends', views.friends),
    path('<userid>/games', views.games),
    path('<userid>/gamestats/<gameid>', views.gamestats),
    path('<userid>/game/<gameid>', views.game),
]