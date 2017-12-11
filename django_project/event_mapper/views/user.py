# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'user'
__date__ = '4/27/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

from django.shortcuts import render_to_response, redirect
from django.template import RequestContext, loader
from django.contrib.auth import (
    login as django_login,
    authenticate,
    logout as django_logout)
from django.contrib.sites.models import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.forms.forms import NON_FIELD_ERRORS
from django.forms.util import ErrorList
from django.contrib.auth.decorators import login_required

from event_mapper.utilities.decorators import login_forbidden
from event_mapper.forms.user import (
    UserCreationForm, LoginForm, ProfileForm, CustomPasswordChangeForm, ForgotPasswordForm)
from event_mapper.models.user import User


@login_forbidden
def register(request):
    """Sign Up view."""
    project_name = 'Watchkeeper'
    # MAIL SENDER
    mail_sender = 'noreply@watchkeeper.org'
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            form.save_m2m()

            current_site = get_current_site(request)
            domain = current_site.domain
            context = {
                'project_name': project_name,
                'protocol': 'http',
                'domain': domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'full_name': '%s %s' % (user.first_name, user.last_name),
                'key': user.key
            }
            email = loader.render_to_string(
                'event_mapper/user/registration_confirmation_email.html',
                context)
            subject = '%s User Registration' % project_name
            sender = '%s - No Reply <%s>' % (project_name, mail_sender)
            send_mail(
                subject, email, sender, [user.email], fail_silently=False)
            messages.success(
                request,
                ('Thank you for registering in our site! Please check your '
                 'email to confirm your registration'))
            return HttpResponseRedirect(reverse('event_mapper:register'))

    else:
        form = UserCreationForm()
    return render_to_response(
        'event_mapper/user/registration_page.html',
        {'form': form},
        context_instance=RequestContext(request)
    )


@login_forbidden
def confirm_registration(request, uid, key):
    """The view containing form to reset password and process it.

    :param request: A django request object.
    :type request: request

    :param uid: A unique id for a user.
    :type uid: str

    :param key: Key to confirm the user.
    :type key: str
    """
    decoded_uid = urlsafe_base64_decode(uid)
    try:
        user = User.objects.get(pk=decoded_uid)

        if not user.is_confirmed:
            if user.key == key:
                user.is_confirmed = True
                user.save(update_fields=['is_confirmed'])
                information = (
                    'Congratulations! Your account has been successfully '
                    'confirmed. Please continue to log in.')
            else:
                information = (
                    'Your link is not valid. Please make sure that you use '
                    'confirmation link we sent to your email.')
        else:
            information = ('Your account is already confirmed. Please '
                           'continue to log in.')
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        information = ('Your link is not valid. Please make sure that you use '
                       'confirmation link we sent to your email.')

    context = {
        'page_header_title': 'Registration Confirmation',
        'information': information
    }
    return render_to_response(
        'event_mapper/information.html',
        context,
        context_instance=RequestContext(request)
    )


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
                    errors = form._errors.setdefault(
                        NON_FIELD_ERRORS, ErrorList())
                    errors.append(
                        'The user is not active. Please contact our '
                        'administrator to resolve this.')
                if not user.is_confirmed:
                    errors = form._errors.setdefault(
                        NON_FIELD_ERRORS, ErrorList())
                    errors.append(
                        'Please confirm you registration email first!')
            else:
                errors = form._errors.setdefault(
                    NON_FIELD_ERRORS, ErrorList())
                errors.append(
                    'Please enter a correct email and password. '
                    'Note that both fields may be case-sensitive.')
    else:
        form = LoginForm()

    return render_to_response(
        'event_mapper/user/login_page.html',
        {'form': form},
        context_instance=RequestContext(request))


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
    return render_to_response(
        'event_mapper/user/profile_page.html',
        {'form': form},
        context_instance=RequestContext(request)
    )


@login_required
def change_password(request):
    if request.method == 'POST':
        form = CustomPasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            user = form.save()
            message = (
                'You have successfully changed your password! Please sign in '
                'to continue updating your profile.')
            messages.success(request, message)
            return HttpResponseRedirect(
                reverse('event_mapper:index'))
    else:
        form = CustomPasswordChangeForm(user=request.user)
    return render_to_response(
        'event_mapper/user/change_password_page.html',
        {'form': form},
        context_instance=RequestContext(request)
    )


@login_forbidden
def forgot_password(request):
    project_name = 'Watchkeeper'
    mail_sender = 'noreply@watchkeeper.org'
    import random
    import string
    from django.core.mail import send_mail

    if request.method == 'POST':
        form = ForgotPasswordForm(data=request.POST)
        if form.is_valid():
            email = request.POST['email']
            try:
                user = User.objects.get(email=email)
                new_password = ''.join(
                    random.choice(string.lowercase + string.uppercase + string.digits) for i in range(10))
                # change to new password
                user.set_password(new_password)
                user.save()
                # send email
                context = {
                    'project_name': project_name,
                    'new_password': new_password,
                    'full_name': '%s %s' % (user.first_name, user.last_name),
                }
                email = loader.render_to_string(
                    'event_mapper/user/forgot_password_confirmation_email.html',
                    context)
                subject = '%s Change Password' % project_name
                sender = '%s - No Reply <%s>' % (project_name, mail_sender)
                send_mail(
                    subject, email, sender, [user.email], fail_silently=False)
                message = (
                    'New password has sent to your email ')
                messages.success(request, message)
            except User.DoesNotExist:
                errors = form._errors.setdefault(
                    NON_FIELD_ERRORS, ErrorList())
                errors.append(
                    'This email is not registered')
    else:
        form = ForgotPasswordForm()
    return render_to_response(
        'event_mapper/user/forgot_password_page.html',
        {'form': form},
        context_instance=RequestContext(request)
    )
