# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django import forms

from .models import AttributeGroup, Attribute, AttributeOption


class SelectWithTitles(forms.Select):
    def __init__(self, queryset, *args, **kwargs):
        super(SelectWithTitles, self).__init__(*args, **kwargs)
        self.queryset = queryset

    def render_option(self, selected_choices, option_value, option_label):
        title = ''
        if option_value != '':
            try:
                title = self.queryset.get(id=int(option_value)).description
            except AttributeOption.DoesNotExist:
                pass

        return '<option value="{}" title="{}">{}</option>'.format(option_value, title, option_label)


class GroupForm(forms.Form):
    def __init__(self, *args, **kwargs):
        attribute_group = kwargs.pop('attribute_group')
        super(GroupForm, self).__init__(*args, **kwargs)

        criterias = Attribute.objects.filter(attribute_group=attribute_group)

        for criteria in criterias:
            if criteria.result_type == 'Integer':
                self.fields[criteria.name] = forms.IntegerField()

            elif criteria.result_type == 'Decimal':
                self.fields[criteria.name] = forms.DecimalField(
                    decimal_places=2, max_digits=9)

            elif criteria.result_type == 'DropDown':
                queryset = AttributeOption.objects.filter(assessment_criteria_id=criteria.id).order_by('position')
                criteria_information = []
                for query in queryset:
                    criteria_information.append(
                        '<b>%s</b></br>%s<br>' % (query.option, query.description.replace('"', '\''))
                    )

                self.fields[criteria.name] = forms.ModelChoiceField(
                    queryset=queryset, widget=SelectWithTitles(queryset),
                    label='<b>%s</b> <span class="question-mark" help="%s">?<span>' % (
                        criteria.name, '<br>'.join(criteria_information)
                    )
                )

            elif criteria.result_type == 'MultipleChoice':
                self.fields[criteria.name] = forms.ModelMultipleChoiceField(
                    queryset=AttributeOption.objects.filter(assessment_criteria_id=criteria.id).order_by('position')
                )


class Group(object):
    def __init__(self, name, group_form):
        self.name = name
        self.group_form = group_form


class AttributeForm(forms.Form):
    # healthsite_id = forms.CharField(max_length=100)
    # assessment_id = forms.CharField(max_length=100)
    name = forms.CharField(max_length=100, min_length=3)
    latitude = forms.CharField()
    longitude = forms.CharField()
    latest_data_captor = forms.CharField()
    latest_update = forms.CharField()
    overall_assessment = forms.IntegerField(min_value=1, max_value=5)

    def groups(self):
        groups = [Group('General', self)]

        for attribute_group in AttributeGroup.objects.all():
            group_form = GroupForm(attribute_group=attribute_group)
            group = Group(attribute_group.name, group_form)
            groups.append(group)

        return groups
