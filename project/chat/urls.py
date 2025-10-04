# urls.py

from django.urls import path
from .views import get_message_history

urlpatterns = [
    path('messages/<str:username>/', get_message_history, name='get_message_history'),
]
