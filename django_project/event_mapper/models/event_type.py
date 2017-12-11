# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'event_type'
__date__ = '4/10/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''


import os
from django.db import models
from django.conf.global_settings import MEDIA_ROOT
from django.utils.text import slugify

icon_directory = 'event_type_icon'
default_icon = 'static/event_mapper/css/images/leaflet/marker-icon.png'


class EventType(models.Model):
    """Event type model."""

    class Meta:
        """Meta Class"""
        app_label = 'event_mapper'

    slug = models.SlugField(
        unique=True,
        primary_key=True,
        blank=True
    )

    name = models.CharField(
        help_text='A name for the event type.',
        null=False,
        blank=False,
        unique=True,
        max_length=100
    )

    incident_icon = models.ImageField(
        help_text='Icon for the event type incident.',
        null=False,
        blank=False,
        upload_to=os.path.join(MEDIA_ROOT, icon_directory),
        default=default_icon
    )

    advisory_icon = models.ImageField(
        help_text='Icon for the event type advisory.',
        null=False,
        blank=False,
        upload_to=os.path.join(MEDIA_ROOT, icon_directory),
        default=default_icon
    )

    description = models.TextField(
        help_text='Description for the event type.',
        blank=True,
    )

    def save(self, *args, **kwargs):
        """Overloaded save method."""
        if not self.slug:
            self.slug = slugify(unicode(self.name))

        super(EventType, self).save(*args, **kwargs)

    def __str__(self):
        return self.name
