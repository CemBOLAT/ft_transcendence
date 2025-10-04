from django.urls import path
from . import views

urlpatterns = [
    path('searchusers/', views.search_users, name='search_users'),
    path('<int:id>/profile/', views.profile, name='profile'),
    path('<int:id>/settings/', views.set_settings, name='settings'),

    path('<int:id>/sendfriendrequest/', views.send_friend_request, name='send_friend_request'),
    path('<int:id>/friendrequests/', views.get_friend_requests, name='get_friend_requests'),
    path('<int:id>/acceptfriendrequest/', views.accept_friend_request, name='accept_friend'),
    path('<int:id>/rejectfriendrequest/', views.reject_friend_request, name='reject_friend_request'),
    path('<int:id>/removefriend/', views.remove_friend, name='remove_friend'),
    path('<int:id>/friendlist', views.get_friends, name="get_friends"),

    path('<int:id>/blockedusers/', views.blocked_users, name='blocked_users'),

    path('<int:id>/games/', views.user_games, name='user_games'),
    path('<int:user_id>/game/<int:game_id>/', views.user_game_detail, name='user_game_detail'),
    
    path('<int:id>/changepassword/', views.change_password, name='change_password'),
    path('<int:id>/changenickname/', views.change_nickname, name='change_nickname'),
    path('<int:id>/upload-avatar/', views.upload_avatar, name='upload_avatar'),
    path('<int:id>/delete-user/', views.delete_user, name='delete_user'),
    path('<int:id>/block_user/', views.block_user, name='block_user'),

]
