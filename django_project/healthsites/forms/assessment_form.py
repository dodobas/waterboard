__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '10/04/16'

import uuid
from django import forms
from django.contrib.gis.geos import Point
from healthsites.models.healthsite import Healthsite
from healthsites.tasks.regenerate_cache import regenerate_cache
from healthsites.models.assessment import (
    AssessmentCriteria, ResultOption, AssessmentGroup)


class GroupForm(forms.Form):
    def __init__(self, *args, **kwargs):
        assessment_group = kwargs.pop('assessment_group', None)
        super(GroupForm, self).__init__(*args, **kwargs)
        criteria = AssessmentCriteria.objects.filter(
            assessment_group=assessment_group)
        for criterium in criteria:
            if criterium.result_type == 'Integer':
                self.fields[criterium.name] = forms.IntegerField()
            elif criterium.result_type == 'Decimal':
                self.fields[criterium.name] = forms.DecimalField(
                    decimal_places=2, max_digits=9)
            elif criterium.result_type == 'DropDown':
                self.fields[criterium.name] = forms.ModelChoiceField(
                    ResultOption.objects.filter(assessment_criteria=criterium))
            elif criterium.result_type == 'MultipleChoice':
                self.fields[criterium.name] = forms.ModelMultipleChoiceField(
                    queryset=ResultOption.objects.filter(
                        assessment_criteria=criterium))


class Group(object):
    def __init__(self, name, group_form):
        self.name = name
        self.group_form = group_form


class AssessmentForm(forms.Form):
    name = forms.CharField(max_length=100, min_length=3)
    latitude = forms.CharField()
    longitude = forms.CharField()
    latest_data_captor = forms.CharField()
    latest_update = forms.CharField()

    def groups(self):
        groups = [Group('General', self)]
        for assessment_group in AssessmentGroup.objects.all():
            group_form = GroupForm(assessment_group=assessment_group)
            group = Group(assessment_group.name, group_form)
            groups.append(group)
        return groups
