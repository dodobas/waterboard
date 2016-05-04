__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '10/04/16'

import uuid
from django import forms
from django.contrib.gis.geos import Point
from healthsites.models.healthsite import Healthsite
from healthsites.tasks.regenerate_cache import regenerate_cache


class AssessmentForm(forms.Form):
    name = forms.CharField(max_length=100, min_length=3)
    latitude = forms.CharField()
    longitude = forms.CharField()

    def save_form(self):
        name = self.cleaned_data.get('name')
        latitude = self.cleaned_data.get('latitude')
        longitude = self.cleaned_data.get('longitude')
        geom = Point(
            float(latitude), float(longitude)
        )
        # find the healthsite
        try:
            healthsite = Healthsite.objects.get(name=name, point_geometry=geom)
            self.create_event(healthsite)
        except Healthsite.DoesNotExist:
            # generate new uuid
            tmp_uuid = uuid.uuid4().hex
            healthsite = Healthsite(name=name, point_geometry=geom, uuid=tmp_uuid, version=1)
            healthsite.save()
            # regenerate_cache.delay()
            self.create_event(healthsite)

    def create_event(self, healthsite):
        # make new event
        pass
