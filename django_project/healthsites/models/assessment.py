__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '21/04/16'

from django.contrib.gis.db import models

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from healthsites.models.healthsite import Healthsite


class HealthsiteAssessment(models.Model):
    healthsite = models.ForeignKey(Healthsite)
    current = models.BooleanField(default=True)
    reference_url = models.URLField(max_length=200)
    reference_file = models.FileField()
    assessment_groups = models.ManyToManyField('HealthsiteAssessmentEntry')

    class Meta:
        app_label = 'healthsites'


class AssessmentGroup(models.Model):
    name = models.CharField(
        help_text='The assessment group.',
        max_length=32,
        null=False,
        blank=False)
    order = models.IntegerField()

    def __unicode__(self):
        return self.name

    class Meta:
        app_label = 'healthsites'


class AssessmentCriteria(models.Model):
    name = models.CharField(
        help_text='The assessment names',
        max_length=32,
        null=False,
        blank=False)
    assessment_group = models.ForeignKey(AssessmentGroup)

    # result_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    # object_id = models.PositiveIntegerField()
    # result_object = GenericForeignKey('result_type', 'object_id')
    def __unicode__(self):
        return self.name

    class Meta:
        app_label = 'healthsites'


class ResultOption(models.Model):
    assessment_criteria = models.ForeignKey(AssessmentCriteria)
    option = models.CharField(max_length=32)
    order = models.IntegerField()

    class Meta:
        app_label = 'healthsites'


class HealthsiteAssessmentEntry(models.Model):
    assessment_criteria = models.ForeignKey(AssessmentCriteria)
    selected_option = models.CharField(max_length=32)

    class Meta:
        app_label = 'healthsites'

