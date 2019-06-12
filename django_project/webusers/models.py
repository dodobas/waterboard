from django import forms
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.contrib.gis.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils.crypto import get_random_string

from attributes.models import AttributeOption
from webusers import const


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None):

        key = get_random_string()
        user = self.model(
            username=username,
            email=self.normalize_email(email),
            key=key
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, username, password):
        user = self.create_user(
            username=username,
            password=password
        )
        user.is_staff = True
        user.save(using=self._db)

        return user


class WebUser(AbstractBaseUser):
    USERNAME_FIELD = const.USERNAME_FIELD
    EMAIL_FIELD = 'email'

    username_validator = UnicodeUsernameValidator()

    username = models.CharField(
        verbose_name='Username',
        max_length=150,
        null=False,
        blank=False,
        unique=True,
        help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.',
        validators=[username_validator],
        error_messages={
            'unique': "A user with that username already exists.",
        },
    )

    email = models.EmailField(
        verbose_name='Email',
        help_text='Please enter your email address. This will also be your login name.',
        null=True,
        blank=True
    )

    full_name = models.CharField(
        verbose_name='Full name',
        help_text='Your full name.',
        max_length=100,
        null=True,
        blank=True
    )

    is_active = models.BooleanField(
        verbose_name='Active',
        help_text='Uncheck this to disable this user\'s account without deleting it.',
        default=True
    )

    is_staff = models.BooleanField(
        verbose_name='Staff',
        help_text='Staff can access admin-control page.',
        default=False
    )

    is_readonly = models.BooleanField(
        verbose_name='Readonly',
        help_text='User can see all data and export but cannot update data',
        default=False
    )

    geofence = models.PolygonField(srid=4326, null=True, blank=True)

    objects = CustomUserManager()

    @property
    def is_superuser(self):
        return self.is_staff

    def has_perm(self, perm, obj=None):
        return self.is_staff

    def has_module_perms(self, app_label):
        return self.is_staff

    def get_short_name(self):
        return self.username

    def get_full_name(self):
        return self.full_name


class MultipleCheckboxField(forms.MultipleChoiceField):
    widget = forms.CheckboxSelectMultiple


class ChoiceArrayField(ArrayField):
    """
    A field that allows us to store an array of choices.

    Uses Django 1.9's postgres ArrayField
    and a MultipleChoiceField for its formfield.

    Usage:
        choices = ChoiceArrayField(models.CharField(max_length=..., choices=(...,)), default=[...])
    """

    def formfield(self, **kwargs):
        defaults = {
            'form_class': MultipleCheckboxField,
            'choices': self.base_field.choices,
        }
        defaults.update(kwargs)
        return super(ArrayField, self).formfield(**defaults)


class Grant(models.Model):
    webuser = models.ForeignKey('WebUser', on_delete=models.PROTECT)
    key = models.CharField(max_length=32, default='woreda')
    values = ChoiceArrayField(models.TextField(blank=True), default=list, blank=True)

    def __str__(self):
        return '%s (%s)' % (self.webuser.email, ', '.join(self.values))

    class Meta:
        unique_together = ('webuser', 'key')


class GrantForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(GrantForm, self).__init__(*args, **kwargs)

        self.fields['values'].choices = [
            (ao.option, ao.option)
            for ao in AttributeOption.objects.filter(attribute__key='woreda').order_by('option').all()
        ]

        self.fields['webuser'].queryset = WebUser.objects.filter(is_staff=False, is_readonly=False).all()

    class Meta:
        model = Grant
        fields = ('webuser', 'values')
