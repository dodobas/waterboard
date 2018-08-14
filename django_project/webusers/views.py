# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.urlresolvers import reverse
from django.forms.forms import NON_FIELD_ERRORS
from django.forms.utils import ErrorList
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render

from .forms import CustomPasswordChangeForm, LoginForm, ProfileForm


@user_passes_test(lambda u: u.is_anonymous)
def login(request):
    """User login view."""
    if request.method == 'POST':
        next_page = request.GET.get('next', '')
        if next_page == '':
            next_page = reverse(settings.START_PAGE_URL)
        form = LoginForm(data=request.POST)
        if form.is_valid():
            user = authenticate(
                email=request.POST['email'],
                password=request.POST['password']
            )
            if user is not None:
                if user.is_active:
                    django_login(request, user)

                    return HttpResponseRedirect(next_page)
                if not user.is_active:
                    errors = form._errors.setdefault(NON_FIELD_ERRORS, ErrorList())
                    errors.append('The user is not active. Please contact our administrator to resolve this.')
            else:
                errors = form._errors.setdefault(NON_FIELD_ERRORS, ErrorList())
                errors.append('Please enter a correct email and password. Note that both fields may be case-sensitive.')
    else:
        form = LoginForm()

    return render(request, 'webuser/login_page.html', {'form': form})


def logout(request):
    """Log out view."""
    django_logout(request)
    return redirect('/')


@login_required
def profile(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            user = form.save(commit=False)
            user.save()
            form.save_m2m()
            messages.success(
                request, 'You have successfully changed your profile!')
            return HttpResponseRedirect(
                reverse('webusers:profile'))
    else:
        form = ProfileForm(instance=request.user)
    return render(request, 'webuser/profile_page.html', {'form': form})


@login_required
def change_password(request):
    if request.method == 'POST':
        form = CustomPasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            message = 'You have successfully changed your password! Please sign in to continue updating your profile.'
            messages.success(request, message)

            return HttpResponseRedirect(reverse(settings.START_PAGE_URL))
    else:
        form = CustomPasswordChangeForm(user=request.user)
    return render(request, 'webuser/change_password_page.html', {'form': form})
