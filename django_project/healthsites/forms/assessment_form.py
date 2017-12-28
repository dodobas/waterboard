# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django import forms

from healthsites.models.assessment import AssessmentCriteria, AssessmentGroup, ResultOption, \
    HealthsiteAssessment
from healthsites.utils import update_event
from webusers.models import WebUser


class SelectWithTitles(forms.Select):
    def __init__(self, queryset, *args, **kwargs):
        super(SelectWithTitles, self).__init__(*args, **kwargs)
        self.queryset = queryset

    def render_option(self, selected_choices, option_value, option_label):
        title = ''
        if option_value != '':
            try:
                title = self.queryset.get(id=int(option_value)).description
            except ResultOption.DoesNotExist:
                pass

        return u'<option value="%s" title="%s">%s</option>' % (
            option_value, title, option_label)


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
                queryset = ResultOption.objects.filter(assessment_criteria=criterium).order_by('order')
                criteria_information = []
                for query in queryset:
                    criteria_information.append('<b>%s</b></br>%s<br>' % (
                        query.option, query.description.replace('"', '\'')))
                self.fields[criterium.name] = forms.ModelChoiceField(
                    queryset=queryset, widget=SelectWithTitles(queryset),
                    label='<b>%s</b> <span class="question-mark" help="%s">?<span>' % (
                        criterium.name, '<br>'.join(criteria_information)))
            elif criterium.result_type == 'MultipleChoice':
                self.fields[criterium.name] = forms.ModelMultipleChoiceField(
                    queryset=ResultOption.objects.filter(
                        assessment_criteria=criterium).order_by('order'))


class Group(object):
    def __init__(self, name, group_form):
        self.name = name
        self.group_form = group_form


class AssessmentForm(forms.ModelForm):
    latitude = forms.CharField()
    longitude = forms.CharField()
    latest_data_captor = forms.CharField()
    latest_update = forms.CharField()

    class Meta:
        model = HealthsiteAssessment
        fields = ['name', 'overall_assessment']

    def groups(self):
        groups = [Group('General', self)]
        for assessment_group in AssessmentGroup.objects.all():
            group_form = GroupForm(assessment_group=assessment_group)
            group = Group(assessment_group.name, group_form)
            groups.append(group)
        return groups

    def save(self, commit=True):
        user = WebUser.objects.get(email=self.cleaned_data['latest_data_captor'])

        self.instance.point_geometry = 'POINT({} {})'.format(self.cleaned_data['latitude'],
                                                             self.cleaned_data['longitude'])
        self.instance.data_captor = user

        self.instance.save()

        # for key in json_values.keys():
        #     try:
        #         child_json = json_values[key]
        #         for child_key in child_json.keys():
        #             try:
        #                 if child_json[child_key] != '':
        #                     criteria = AssessmentCriteria.objects.get(name=child_key,
        #                                                               assessment_group__name=key)
        #                     if criteria.result_type == 'Integer':
        #                         # insert the value
        #                         # entry decimal
        #                         insert_update_to_entry(
        #                             HealthsiteAssessmentEntryInteger, assessment, criteria,
        #                             int(child_json[child_key]))
        #                     elif criteria.result_type == 'Decimal':
        #                         # entry decimal
        #                         insert_update_to_entry(
        #                             HealthsiteAssessmentEntryReal, assessment, criteria,
        #                             float(child_json[child_key]))
        #                     else:
        #                         # entry dropdown
        #                         insert_update_to_entry(
        #                             HealthsiteAssessmentEntryDropDown, assessment, criteria,
        #                             child_json[child_key])
        #             except AssessmentCriteria.DoesNotExist:
        #                 pass
        #     except AttributeError:
        #         pass
        #
        #     insert_values(assessment, json_values)
        #     return assessment
        #
        #


        return super(AssessmentForm, self).save(commit)
