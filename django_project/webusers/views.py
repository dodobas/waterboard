# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib import messages
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.core.urlresolvers import reverse
from django.forms.forms import NON_FIELD_ERRORS
from django.forms.utils import ErrorList
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render
from django.template import loader
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from .forms import CustomPasswordChangeForm, ForgotPasswordForm, LoginForm, ProfileForm, UserCreationForm
from .models import WebUser
from .decorators import login_forbidden


@login_forbidden
def register(request):
    """Sign Up view."""
    project_name = 'Waterboard'
    # MAIL SENDER
    mail_sender = 'noreply@watreboard.org'
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            form.save_m2m()

            domain = 'custom-domain'

            context = {
                'project_name': project_name,
                'protocol': 'http',
                'domain': domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'full_name': '%s %s' % (user.first_name, user.last_name),
                'key': user.key
            }
            email = loader.render_to_string('user/registration_confirmation_email.html', context)
            subject = '%s User Registration' % project_name
            sender = '%s - No Reply <%s>' % (project_name, mail_sender)
            send_mail(
                subject, email, sender, [user.email], fail_silently=False)
            messages.success(
                request,
                ('Thank you for registering in our site! Please check your '
                 'email to confirm your registration')
            )

            return HttpResponseRedirect(reverse('register'))

    else:
        form = UserCreationForm()
    return render(request, 'user/registration_page.html', {'form': form})


@login_forbidden
def confirm_registration(request, uid, key):
    decoded_uid = urlsafe_base64_decode(uid)
    try:
        user = WebUser.objects.get(pk=decoded_uid)

        if not user.is_confirmed:
            if user.key == key:
                user.is_confirmed = True
                user.save(update_fields=['is_confirmed'])
                information = (
                    'Congratulations! Your account has been successfully '
                    'confirmed. Please continue to log in.'
                )
            else:
                information = (
                    'Your link is not valid. Please make sure that you use '
                    'confirmation link we sent to your email.'
                )
        else:
            information = ('Your account is already confirmed. Please '
                           'continue to log in.')
    except (TypeError, ValueError, OverflowError, WebUser.DoesNotExist):
        information = ('Your link is not valid. Please make sure that you use '
                       'confirmation link we sent to your email.')

    context = {
        'page_header_title': 'Registration Confirmation',
        'information': information
    }
    return render(request, 'user/information.html', context)


@login_forbidden
def login(request):
    """User login view."""
    if request.method == 'POST':
        next_page = request.GET.get('next', '')
        if next_page == '':
            next_page = reverse('event_mapper:index')
        form = LoginForm(data=request.POST)
        if form.is_valid():
            user = authenticate(
                email=request.POST['email'],
                password=request.POST['password']
            )
            if user is not None:
                if user.is_active and user.is_confirmed:
                    django_login(request, user)

                    return HttpResponseRedirect(next_page)
                if not user.is_active:
                    errors = form._errors.setdefault(NON_FIELD_ERRORS, ErrorList())
                    errors.append('The user is not active. Please contact our administrator to resolve this.')
                if not user.is_confirmed:
                    errors = form._errors.setdefault(NON_FIELD_ERRORS, ErrorList())
                    errors.append(
                        'Please confirm you registration email first!')
            else:
                errors = form._errors.setdefault(NON_FIELD_ERRORS, ErrorList())
                errors.append('Please enter a correct email and password. Note that both fields may be case-sensitive.')
    else:
        form = LoginForm()

    return render(request, 'user/login_page.html', {'form': form})


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
                reverse('event_mapper:profile'))
    else:
        form = ProfileForm(instance=request.user)
    return render(request, 'user/profile_page.html', {'form': form})


@login_required
def change_password(request):
    if request.method == 'POST':
        form = CustomPasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            message = 'You have successfully changed your password! Please sign in to continue updating your profile.'
            messages.success(request, message)

            return HttpResponseRedirect(reverse('event_mapper:index'))
    else:
        form = CustomPasswordChangeForm(user=request.user)
    return render(request, 'user/change_password_page.html', {'form': form})


@login_forbidden
def forgot_password(request):
    project_name = 'Waterboard'
    mail_sender = 'noreply@waterbaord.io'
    import random
    import string
    from django.core.mail import send_mail

    if request.method == 'POST':
        form = ForgotPasswordForm(data=request.POST)
        if form.is_valid():
            email = request.POST['email']
            try:
                user = WebUser.objects.get(email=email)
                new_password = ''.join(
                    random.choice(string.lowercase + string.uppercase + string.digits) for _ in range(10)
                )
                # change to new password
                user.set_password(new_password)
                user.save()
                # send email
                context = {
                    'project_name': project_name,
                    'new_password': new_password,
                    'full_name': '%s %s' % (user.first_name, user.last_name),
                }
                email = loader.render_to_string('user/forgot_password_confirmation_email.html', context)
                subject = '%s Change Password' % project_name
                sender = '%s - No Reply <%s>' % (project_name, mail_sender)
                send_mail(subject, email, sender, [user.email], fail_silently=False)

                message = 'New password has sent to your email '
                messages.success(request, message)
            except WebUser.DoesNotExist:
                errors = form._errors.setdefault(NON_FIELD_ERRORS, ErrorList())
                errors.append('This email is not registered')
    else:
        form = ForgotPasswordForm()
    return render(request, 'user/forgot_password_page.html', {'form': form})
