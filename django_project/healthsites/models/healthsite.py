# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.gis.db import models

from event_mapper.models.country import Country


class Healthsite(models.Model):
    """This is a model """
    name = models.CharField(
        verbose_name='Name',
        help_text='What the healthsite is called',
        max_length=100,
        null=False,
        blank=False)

    point_geometry = models.PointField(
        srid=4326)

    version = models.IntegerField()

    uuid = models.CharField(
        verbose_name='UUID',
        help_text='Unique identifier',
        max_length=32,
        null=False,
        blank=False,
        unique=True)

    date = models.DateTimeField(auto_now_add=True)

    id = models.AutoField(
        primary_key=True)

    is_healthsites_io = models.BooleanField(
        default=False)

    objects = models.GeoManager()

    def __unicode__(self):
        return self.name

    class Meta:
        app_label = 'healthsites'

    def get_dict(self):
        output = {}
        output['name'] = self.name
        output['geometry'] = [self.point_geometry.x, self.point_geometry.y]
        country = Country.objects.filter(polygon_geometry__contains=self.point_geometry)
        if len(country):
            output['country'] = country[0].name
        return output
