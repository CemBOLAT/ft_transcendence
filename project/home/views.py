from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.urls import reverse


def user_logout(request):
    logout(request)
    return redirect(reverse('home'))


@login_required
def home(request):
    user = request.user
    context = {
        'username': user.username,
        'email': user.email,
    }
    return render(request, 'home/home.html', context)

@login_required
def user_logout(request):
    logout(request)
    return redirect(reverse('home'))
