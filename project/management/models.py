from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')

        user = self.model(
            email=self.normalize_email(email),
            username=username,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None):
        user = self.create_user(
            email=self.normalize_email(email),
            username=username,
            password=password,
        )

        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

    def get_by_natural_key(self, username):
        return self.get(username=username)

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    friends = models.ManyToManyField("self", blank=True)
    games = models.ManyToManyField('Game', blank=True, related_name='players')
    nickname = models.CharField(max_length=100, blank=True, null=True)
    win = models.IntegerField(default=0)
    lose = models.IntegerField(default=0)
    is_42_student = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    email_token = models.CharField(max_length=100, blank=True, null=True)
    is_activate_2fa = models.BooleanField(default=False)
    reset_password_token = models.CharField(max_length=100, blank=True, null=True)
    friend_notifications = models.BooleanField(default=False)
    chat_notifications = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin

    @is_staff.setter
    def is_staff(self, value):
        self._is_staff = value

    @property
    def is_superuser(self):
        return self._is_superuser

    @is_superuser.setter
    def is_superuser(self, value):
        self._is_superuser = value

class FriendRequest(models.Model):
    from_user = models.ForeignKey(
        User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(
        User, related_name='received_requests', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)

    class Meta:
        unique_together = ('from_user', 'to_user')

class Game(models.Model):
    user1 = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name='games_as_user1')
    user2 = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name='games_as_user2')
    user1Score = models.IntegerField(_("User 1 Score"), default=0)
    user2Score = models.IntegerField(_("User 2 Score"), default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class TournamentGame(models.Model):
    user1 = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name='games_as_user1_tournament')
    user2 = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name='games_as_user2_tournament')
    tournament = models.ForeignKey(
        "Tournament", on_delete=models.CASCADE, related_name='tournament_games')
    user1Score = models.IntegerField(_("User 1 Score"), default=0)
    user2Score = models.IntegerField(_("User 2 Score"), default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class Tournament(models.Model):
    tournamentName = models.CharField(max_length=100)
    tournamentUsers = models.ManyToManyField(
        User, blank=True, related_name='tournaments')
    tournamentGame = models.ManyToManyField(
        TournamentGame, blank=True, related_name='tournaments')
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    is_game_invite = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.sender} to {self.receiver}: {self.content}'

class UserBlock(models.Model):
    blocked_user = models.ForeignKey(User, related_name='blocked_user', on_delete=models.CASCADE)
    blocked_by = models.ForeignKey(User, related_name='blocked_by', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('blocked_user', 'blocked_by')
