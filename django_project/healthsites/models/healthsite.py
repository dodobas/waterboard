__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '15/04/16'
__project_name = 'hcid-watchkeeper'

from django.contrib.gis.db import models


class Healthsite(models.Model):
    """This is an abstract model that vectors can inherit from. e.g. country"""
    name = models.CharField(
        verbose_name='Name',
        help_text='What the healthsite is called',
        max_length=50,
        null=False,
        blank=False)

    point_geometry = models.PointField(
        srid=4326)

    version = models.IntegerField()

    uuid = models.CharField(
        verbose_name='UUID',
        help_text='Unique identifier',
        max_length=30,
        null=False,
        blank=False)

    date = models.DateTimeField()

    id = models.AutoField(
        primary_key=True)

    objects = models.GeoManager()

    def __unicode__(self):
        return self.name

    class Meta:
        app_label = 'healthsites'