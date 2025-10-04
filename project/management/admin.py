from django.contrib import admin
from .models import Game, User, Tournament, FriendRequest, Message
# Register your models here.

admin.site.register(Game)
admin.site.register(User)

admin.site.register(Tournament)
admin.site.register(FriendRequest)

admin.site.register(Message)