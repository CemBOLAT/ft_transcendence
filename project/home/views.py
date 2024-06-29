from django.shortcuts import render

# Create your views here.

def home(request, user):
	return render(request, 'home/home.html', {'user': user})
