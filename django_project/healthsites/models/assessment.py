# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import datetime

from django.contrib.gis.db import models


from .healthsite import Healthsite


# default to 1 day from now
def get_overall_assessment_random():
    import random
    return random.randint(1, 5)


class HealthsiteAssessment(models.Model):
    healthsite = models.ForeignKey(Healthsite)
    name = models.CharField(
        verbose_name='Name',
        help_text='What the assessment is called',
        max_length=100,
        null=False,
        blank=False)
    point_geometry = models.PointField(
        srid=4326,
        null=False,
        blank=False)
    current = models.BooleanField(default=True)
    reference_url = models.URLField(max_length=200, blank=True)
    reference_file = models.FileField(blank=True)
    created_date = models.DateTimeField(default=datetime.datetime.now)
    data_captor = models.ForeignKey('webusers.WebUser', default=None)

    overall_assessment = models.IntegerField()

    # def get_context_data(self):
    #     context = {}
    #     for option in HealthsiteAssessmentEntryDropDown.objects.filter(
    #             healthsite_assessment=self.id):
    #         key = option.assessment_criteria.placeholder
    #         option_id = option.selected_option
    #         value = ResultOption.objects.get(id=option_id).value
    #         context[key] = value
    #     return context

    def __unicode__(self):
        return u'%s - %s' % (self.name, self.created_date)

    class Meta:
        app_label = 'healthsites'
