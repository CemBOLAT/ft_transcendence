from django.urls import path
from .consumers import ActiveUserConsumer

websocket_urlpatterns = [
    path('ws/active/', ActiveUserConsumer.as_asgi()),
]