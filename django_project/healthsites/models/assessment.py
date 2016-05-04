__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '21/04/16'

from django.contrib.gis.db import models

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from healthsites.models.healthsite import Healthsite

RESULTOPTIONS = (
    ('DropDown', 'DropDown'),
    ('Integer', 'Integer'),
    ('Decimal', 'Decimal')
)


class HealthsiteAssessment(models.Model):
    healthsite = models.ForeignKey(Healthsite)
    current = models.BooleanField(default=True)
    reference_url = models.URLField(max_length=200)
    reference_file = models.FileField()

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
    result_type = models.CharField(
        max_length=32,
        choices=RESULTOPTIONS,
        null=False,
        blank=False)

    # result_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    # object_id = models.PositiveIntegerField()
    # result_object = GenericForeignKey('result_type', 'object_id')
    def __unicode__(self):
        return self.name

    class Meta:
        app_label = 'healthsites'


class ResultOption(models.Model):
    assessment_criteria = models.ForeignKey(
        AssessmentCriteria,
        limit_choices_to={
            'result_type': 'DropDown',
        })
    option = models.CharField(max_length=32)
    value = models.IntegerField()
    order = models.IntegerField()

    class Meta:
        app_label = 'healthsites'


class HealthsiteAssessmentEntry(models.Model):
    healthsite_assessment = models.ForeignKey(HealthsiteAssessment)
    assessment_criteria = models.ForeignKey(AssessmentCriteria)

    class Meta:
        app_label = 'healthsites'
        abstract = True


class HealthsiteAssessmentEntryDropDown(HealthsiteAssessmentEntry):
    selected_option = models.CharField(max_length=32)

    class Meta:
        app_label = 'healthsites'


class HealthsiteAssessmentEntryInteger(HealthsiteAssessmentEntry):
    selected_option = models.IntegerField()

    class Meta:
        app_label = 'healthsites'


class HealthsiteAssessmentEntryReal(HealthsiteAssessmentEntry):
    selected_option = models.DecimalField(decimal_places=2, max_digits=9)

    class Meta:
        app_label = 'healthsites'
