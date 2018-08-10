# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django import forms
from django.contrib.auth.forms import PasswordChangeForm

from .models import WebUser


class ProfileForm(forms.ModelForm):
    """A form for profile."""

    class Meta:
        model = WebUser
        fields = ('email', 'full_name')

        widgets = {
            'email': forms.EmailInput(
                attrs={
                    'class': 'form-control',
                    'placeholder': 'john@doe.com'
                }
            ),
            'full_name': forms.TextInput(
                attrs={
                    'class': 'form-control',
                    'placeholder': 'John Dow'}
            ),
        }

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)


class LoginForm(forms.Form):
    """Form for user to log in."""

    class Meta:
        """Meta of the form."""
        fields = ['email', 'password']

    email = forms.EmailField(
        label='Email',
        widget=forms.EmailInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'john@doe.com'})
    )
    password = forms.CharField(
        label='Password',
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Your s3cr3T password'})
    )


class CustomPasswordChangeForm(PasswordChangeForm):
    """Form for changing user's password"""

    class Meta:
        """Meta of the form."""
        fields = ['old_password', 'new_password1', 'new_password2']

    old_password = forms.CharField(
        label='Old password',
        widget=forms.PasswordInput(
            attrs={'class': 'form-control'})
    )

    new_password1 = forms.CharField(
        label='New password',
        widget=forms.PasswordInput(
            attrs={'class': 'form-control'})
    )
    new_password2 = forms.CharField(
        label='New password confirmation',
        widget=forms.PasswordInput(
            attrs={'class': 'form-control'})
    )
