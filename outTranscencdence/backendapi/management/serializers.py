
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

class UserSerializer(serializers.Serializer):
	username = serializers.CharField()
	userID = serializers.IntegerField()
	email = serializers.EmailField()
	password = serializers.CharField()
	friends = serializers.ManyToManyField('self', blank=True, default=[])
	games = serializers.ManyToManyField(Game, blank=True, default=[])

	def create(self, validated_data):
		return User.objects.create(**validated_data)

	def update(self, instance, validated_data):
		instance.username = validated_data.get('username', instance.username)
		instance.userID = validated_data.get('userID', instance.userID)
		instance.email = validated_data.get('email', instance.email)
		instance.password = validated_data.get('password', instance.password)
		instance.friends = validated_data.get('friends', instance.friends)
		instance.games = validated_data.get('games', instance.games)
		instance.save()
		return instance

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
