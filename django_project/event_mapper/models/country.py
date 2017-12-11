# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'country'
__date__ = '4/20/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

from event_mapper.models.boundary import Boundary


class Country(Boundary):
    """Class for Country."""

    class Meta:
        """Meta Class"""
        app_label = 'event_mapper'
        verbose_name_plural = 'Countries'


Country._meta.get_field('name').verbose_name = 'Country name'
Country._meta.get_field('name').help_text = 'The name of the country.'
