from django.contrib import admin
from management.models import Game, User, Tournament

# Register your models here.

admin.site.register(Game)
admin.site.register(User)
admin.site.register(Tournament)

