from django import forms
from management.models import User

class AvatarUploadForm(forms.Form):
    avatar = forms.ImageField()

