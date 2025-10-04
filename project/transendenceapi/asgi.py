"""
ASGI config for transendenceapi project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transendenceapi.settings')

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

from channels.auth import AuthMiddlewareStack
from user import routing as user_routing
from chat import routing as chat_routing
from game import routing as game_routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            user_routing.websocket_urlpatterns + chat_routing.websocket_urlpatterns + game_routing.websocket_urlpatterns
        )
    ),
})

