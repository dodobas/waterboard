__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '15/04/16'
__project_name = 'hcid-watchkeeper'

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

    def get_assessment(self):
        from healthsites.models.assessment import HealthsiteAssessment
        output = {}
        assessments = HealthsiteAssessment.objects.filter(healthsite=self).order_by('-created_date')
        if len(assessments) >= 1:
            output['assessments'] = assessments[0].get_dict()['assessment']
        return output
