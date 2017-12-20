# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.gis.db import models
from django.contrib.gis.db.models import GeoManager
from django.utils.crypto import get_random_string


class CustomUserManager(BaseUserManager, GeoManager):
    def create_user(self, email, full_name, password=None):

        if not (email or full_name):
            raise ValueError('User must have an email and a full name.')

        key = get_random_string()
        user = self.model(
            email=self.normalize_email(email),
            full_name=full_name,
            key=key
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password, full_name):
        user = self.create_user(
            email=email,
            full_name=full_name,
            password=password
        )
        user.is_staff = True
        user.is_confirmed = True
        user.save(using=self._db)

        return user


class WebUser(AbstractBaseUser):
    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    email = models.EmailField(
        verbose_name='Email',
        help_text='Please enter your email address. This will also be your login name.',
        null=False,
        blank=False,
        unique=True
    )

    full_name = models.CharField(
        verbose_name='Full name',
        help_text='Your full name.',
        max_length=100,
        null=False,
        blank=False
    )

    is_active = models.BooleanField(
        verbose_name='Active',
        help_text='Uncheck this to disable this user\'s account without deleting it.',
        default=True
    )

    is_staff = models.BooleanField(
        verbose_name='Staff',
        help_text='Staff can access wk-admin page.',
        default=False
    )

    key = models.CharField(
        verbose_name='Account confirmation key',
        help_text='Account confirmation key as sent to the user by email.',
        max_length=40,
        default='0000000000000000000000000000000000000000'
    )

    is_confirmed = models.BooleanField(
        verbose_name='Confirmed',
        help_text='Whether this user has activated their account by email.',
        null=False,
        default=False
    )

    objects = CustomUserManager()

    @property
    def is_superuser(self):
        return self.is_staff

    def has_perm(self, perm, obj=None):
        return self.is_staff

    def has_module_perms(self, app_label):
        return self.is_staff

    def get_short_name(self):
        return self.full_name

    def get_full_name(self):
        return '%s (%s)' % (self.email, self.full_name)
