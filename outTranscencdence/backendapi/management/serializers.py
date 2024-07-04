
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import Tournament, Game, User

class GameSerializer(serializers.Serializer):
	gameID = serializers.IntegerField()
	user1ID = serializers.IntegerField()
	user2ID = serializers.IntegerField()
	tournamentID = serializers.IntegerField()
	user1Score = serializers.IntegerField()
	user2Score = serializers.IntegerField()

	def create(self, validated_data):
		return Game.objects.create(**validated_data)

	def update(self, instance, validated_data):
		instance.gameID = validated_data.get('gameID', instance.gameID)
		instance.user1ID = validated_data.get('user1ID', instance.user1ID)
		instance.user2ID = validated_data.get('user2ID', instance.user2ID)
		instance.tournamentID = validated_data.get('tournamentID', instance.tournamentID)
		instance.user1Score = validated_data.get('user1Score', instance.user1Score)
		instance.user2Score = validated_data.get('user2Score', instance.user2Score)
		instance.save()
		return instance


class UserSerializer(serializers.ModelSerializer):
    friends = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all())
    games = serializers.PrimaryKeyRelatedField(many=True, queryset=Game.objects.all())

    class Meta:
        model = User
        fields = ['username', 'userID', 'email', 'password', 'friends', 'games']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super(UserSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super(UserSerializer, self).update(instance, validated_data)


class TournamentSerializer(serializers.Serializer):
	tournamentID = serializers.IntegerField()
	tournamentName = serializers.CharField()
	tournamentUserIds = serializers.IntegerField()
	tournamentGameIds = serializers.IntegerField()

	def create(self, validated_data):
		return Tournament.objects.create(**validated_data)

	def update(self, instance, validated_data):
		instance.tournamentID = validated_data.get('tournamentID', instance.tournamentID)
		instance.tournamentName = validated_data.get('tournamentName', instance.tournamentName)
		instance.tournamentUserIds = validated_data.get('tournamentUserIds', instance.tournamentUserIds)
		instance.tournamentGameIds = validated_data.get('tournamentGameIds', instance.tournamentGameIds)
		instance.save()
		return instance
