__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '10/04/16'

from django import forms
from healthsites.models.assessment import (
    AssessmentCriteria, ResultOption, AssessmentGroup)


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
                    criteria_information.append("<b>%s</b></br>%s<br>" % (
                        query.option, query.description.replace('"', '\'')))
                self.fields[criterium.name] = forms.ModelChoiceField(
                    queryset=queryset, widget=SelectWithTitles(queryset),
                    label='<b>%s</b> <span class="question-mark" help="%s">?<span>' % (
                        criterium.name, "<br>".join(criteria_information)))
            elif criterium.result_type == 'MultipleChoice':
                self.fields[criterium.name] = forms.ModelMultipleChoiceField(
                    queryset=ResultOption.objects.filter(
                        assessment_criteria=criterium).order_by('order'))


class Group(object):
    def __init__(self, name, group_form):
        self.name = name
        self.group_form = group_form


class AssessmentForm(forms.Form):
    healthsite_id = forms.CharField(max_length=100)
    assessment_id = forms.CharField(max_length=100)
    name = forms.CharField(max_length=100, min_length=3)
    latitude = forms.CharField()
    longitude = forms.CharField()
    latest_data_captor = forms.CharField()
    latest_update = forms.CharField()
    overall_assessment = forms.IntegerField(min_value=1, max_value=5)

    def groups(self):
        groups = [Group('General', self)]
        for assessment_group in AssessmentGroup.objects.all():
            group_form = GroupForm(assessment_group=assessment_group)
            group = Group(assessment_group.name, group_form)
            groups.append(group)
        return groups
