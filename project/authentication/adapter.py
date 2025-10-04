from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth.models import User

class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        # Kullanıcı oluşturma ve güncelleme için özel mantık
        user_data = sociallogin.account.extra_data
        username = user_data.get('login')
        email = user_data.get('email')
        
        user, created = User.objects.get_or_create(username=username, defaults={'email': email})
        if not created:
            user.email = email
            user.save()
        sociallogin.connect(request, user)
