__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '21/04/16'

from django.contrib.gis.db import models


class WatchkeeperSettings(models.Model):
    alerts = models.BooleanField(
        default=False,
        help_text='Use the alerts module.')

    movements = models.BooleanField(
        default=False,
        help_text='Use the movements module.')

    healthsites = models.BooleanField(
        default=True,
        help_text='Use the healthsites module.')

    class Meta:
        app_label = 'watchkeeper_settings'
