# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.gis.db import models


class Country(models.Model):
    """Class for Country."""

    name = models.CharField(
        verbose_name='Country name',
        help_text='The name of the country.',
        max_length=50,
        null=False,
        blank=False)

    polygon_geometry = models.MultiPolygonField(srid=4326)

    id = models.AutoField(primary_key=True)

    objects = models.GeoManager()

    class Meta:
        verbose_name_plural = 'Countries'
