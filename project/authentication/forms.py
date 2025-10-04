from django import forms
from management.models import User

class UserSignupForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    

    def clean_username(self):
        username = self.cleaned_data.get('username')
        #username is empty
        if not username:
            raise forms.ValidationError("Username is required")
        if '_' in username:
            raise forms.ValidationError("Username cannot contain underscore ('_')")
        if not username.isascii():
            raise forms.ValidationError("Username can only contain english characters")
        if not username.isalnum():
            raise forms.ValidationError("Username can only contain letters and numbers")
        # if name containes non english characters
        return username

    def clean_email(self):
        email = self.cleaned_data.get('email')
        #email is empty
        if not email:
            raise forms.ValidationError("Email is required")
        return email
    
    def clean_password(self):
        password = self.cleaned_data.get('password')
        #password is empty
        if not password:
            raise forms.ValidationError("Password is required")
        if len(password) < 8:
            raise forms.ValidationError("Password must be at least 8 characters long")
        if not any(char.isdigit() for char in password):
            raise forms.ValidationError("Password must contain at least one digit")
        if not any(char.islower() for char in password):
            raise forms.ValidationError("Password must contain at least one lowercase letter")
        if not any(char.isupper() for char in password):
            raise forms.ValidationError("Password must contain at least one uppercase letter")
        return password