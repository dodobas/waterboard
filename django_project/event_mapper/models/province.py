# coding=utf-8
"""Model class for the concrete Province (or State.)"""
__author__ = 'Christian Christelis <christian@kartoza.com>'
__project_name = 'watchkeeper'
__filename = 'province.py'
__date__ = '19/06/2015'

from django.contrib.gis.db import models

from event_mapper.models.boundary import Boundary
from event_mapper.models.country import Country


class Province(Boundary):
    """Class for Country."""

    country = models.ForeignKey(Country)

    class Meta:
        """Meta Class"""
        app_label = 'event_mapper'
        verbose_name_plural = 'Provinces'


Province._meta.get_field('name').verbose_name = 'Province or State name'
Province._meta.get_field('name').help_text = (
    'The name of the province or state.')
