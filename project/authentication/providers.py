from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider

class FortyTwoProvider(OAuth2Provider):
    id = '42'
    name = '42'
    package = 'auth_app.providers'

provider_classes = [FortyTwoProvider]
