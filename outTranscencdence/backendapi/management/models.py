from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.
class Game(models.Model):
    gameID = models.IntegerField(_("Game ID"), primary_key=True)
    user1ID = models.IntegerField(_("User 1 ID"))
    user2ID = models.IntegerField(_("User 2 ID"))
    tournamentID = models.IntegerField(_("Tournament ID"), default=-1)
    user1Score = models.IntegerField(_("User 1 Score"), default=0)
    user2Score = models.IntegerField(_("User 2 Score"), default=0)


class User(models.Model):
    username = models.CharField(max_length=100)
    userID = models.IntegerField(_("User ID"), primary_key=True)
    email = models.EmailField()
    password = models.CharField(max_length=100)
    friends = models.ManyToManyField("self", blank=True)
    games = models.ManyToManyField(Game, blank=True)

class Tournament(models.Model):
    tournamentID = models.IntegerField(_("Tournament ID"), primary_key=True)
    tournamentName = models.CharField(max_length=100)
    tournamentUserIds = models.IntegerField(_("Tournament User IDs"), default=[], blank=True)
    tournamentGameIds = models.IntegerField(_("Tournament Game IDs"), default=[], blank=True)
