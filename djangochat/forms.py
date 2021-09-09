from django import forms
from .models import MoodleAuthentication
class MoodleAuthenticationForm(forms.ModelForm):
    class Meta:
        model = MoodleAuthentication
        fields = '__all__'
