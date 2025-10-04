from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import models
from management.models import Message, User
from management.serializers import MessageSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_message_history(request, username):
    user1 = request.user
    try:
        user2 = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    
    messages = Message.objects.filter(
        (models.Q(sender=user1) & models.Q(receiver=user2)) | 
        (models.Q(sender=user2) & models.Q(receiver=user1))
    ).order_by('timestamp')
    
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)
