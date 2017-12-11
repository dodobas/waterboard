# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'rating'
__date__ = '5/11/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''


from django.db import models


class Rating(models.Model):
    """Rating Model."""

    class Meta:
        """Meta class"""
        app_label = 'event_mapper'

    label = models.CharField(
        verbose_name='Rating label',
        help_text='The name of the rating.',
        max_length=100
    )

    level = models.IntegerField(
        verbose_name='Level',
        help_text='The level of the rating.',
    )

    def __str__(self):
        return self.label
