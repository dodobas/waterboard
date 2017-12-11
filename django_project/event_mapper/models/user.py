# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'user'
__date__ = '4/20/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

from django.contrib.auth.models import AbstractBaseUser
from django.contrib.gis.db import models
from django.core.validators import RegexValidator

from event_mapper.models.country import Country
from event_mapper.models.user_manager import CustomUserManager


class User(AbstractBaseUser):
    """User class for event_mapper app."""

    class Meta:
        """Meta Class"""
        app_label = 'event_mapper'

    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: "
                "'+6288888888888'. Up to 15 digits allowed.")

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
        Country,
        verbose_name='Countries of interest',
        help_text=(
            'Select one or more countries for which you wish to '
            'receive notifications.'),
        null=True,
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

    @property
    def is_superuser(self):
        return self.is_admin

    def has_perm(self, perm, obj=None):
        return self.is_admin or self.is_staff

    def has_module_perms(self, app_label):
        return self.is_admin or self.is_staff

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def get_short_name(self):
        return self.first_name

    def get_full_name(self):
        return '%s %s' % (self.first_name, self.last_name)
