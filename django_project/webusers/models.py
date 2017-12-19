# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.gis.db import models
from django.contrib.gis.db.models import GeoManager
from django.core.validators import RegexValidator
from django.utils.crypto import get_random_string


class CustomUserManager(BaseUserManager, GeoManager):
    def create_user(self, email, first_name, last_name, phone_number='', notified=False, password=None):

        if not email:
            raise ValueError('User must have email.')

        key = get_random_string()
        user = self.model(
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            notified=notified,
            key=key
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, first_name, last_name, email, password):
        user = self.create_user(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
        )

        user.phone_number = ''
        user.is_confirmed = True
        user.is_active = True
        user.is_admin = True
        user.is_staff = True
        user.is_data_captor = True
        user.save(using=self._db)

        return user


class WebUser(AbstractBaseUser):
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message='Phone number must be entered in the format: "+6288888888888". Up to 15 digits allowed.'
    )

    email = models.EmailField(
        verbose_name='Email',
        help_text=(
            'Please enter your email address. '
            'This will also be your login name.'),
        null=False,
        blank=False,
        unique=True
    )

    first_name = models.CharField(
        verbose_name='First name',
        help_text='Your first name.',
        max_length=100,
        null=False,
        blank=False
    )

    last_name = models.CharField(
        verbose_name='Last name',
        help_text='Your last name.',
        max_length=100,
        null=False,
        blank=False
    )

    phone_number = models.CharField(
        verbose_name='Phone number',
        help_text=(
            'This is optional. '
            'If entered alerts will be sent to this number'),
        max_length=15,
        null=True,
        blank=True,
        validators=[phone_regex]
    )

    notified = models.BooleanField(
        verbose_name='Receive notifications?',
        help_text='Check this box to receive SMS notifications.',
        null=False,
        blank=True,
        default=False
    )

    countries_notified = models.ManyToManyField(
        'country.Country',
        verbose_name='Countries of interest',
        help_text=(
            'Select one or more countries for which you wish to '
            'receive notifications.'),
        blank=True
    )

    is_active = models.BooleanField(
        verbose_name='Active',
        help_text=(
            'Unchecked this to disable this user\'s account '
            'without deleting it.'),
        default=True)

    is_admin = models.BooleanField(
        verbose_name='Admin',
        help_text='Check this to make the user an admin.',
        default=False)

    is_staff = models.BooleanField(
        verbose_name='Staff',
        help_text='Staff can access wk-admin page.',
        default=False)

    is_data_captor = models.BooleanField(
        verbose_name='Data capturer',
        help_text='Data capturer can add events.',
        default=False)

    north = models.FloatField(
        verbose_name='North',
        help_text='The northern boundary of the area of interest.',
        default=40
    )

    east = models.FloatField(
        verbose_name='East',
        help_text='The eastern boundary of the area of interest.',
        default=55
    )

    south = models.FloatField(
        verbose_name='South',
        help_text='The southern boundary of the area of interest.',
        default=24
    )

    west = models.FloatField(
        verbose_name='West',
        help_text='The western boundary of the area of interest.',
        default=28
    )

    key = models.CharField(
        verbose_name='Account confirmation key',
        help_text='Account confirmation key as sent to the user by email.',
        max_length=40,
        default='0000000000000000000000000000000000000000')

    is_confirmed = models.BooleanField(
        verbose_name='Confirmed',
        help_text='Whether this user has activated their account by email.',
        null=False,
        default=False)

    notify_immediately = models.BooleanField(
        verbose_name='Notify immediately',
        help_text=(
            'Check this to activate immediate notifications. '
            'If unchecked, the user will only be notified by '
            'nightly batch reports.'),
        default=False
    )

    objects = CustomUserManager()

    @property
    def is_superuser(self):
        return self.is_admin

    def has_perm(self, perm, obj=None):
        return self.is_admin or self.is_staff

    def has_module_perms(self, app_label):
        return self.is_admin or self.is_staff

    def get_short_name(self):
        return self.first_name

    def get_full_name(self):
        return '%s %s' % (self.first_name, self.last_name)
