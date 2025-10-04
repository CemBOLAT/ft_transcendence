from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf.urls.static import static
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/', include('user.urls')),
    path('api/game/', include('game.urls')),
    path('api/auth/', include('authentication.urls')),
    path('accounts/', include('allauth.urls')),
    path('api/chat/', include('chat.urls')),

    re_path(r'^api/media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
