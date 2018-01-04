# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django import forms

from .models import Attribute, AttributeGroup, AttributeOption


class GroupForm(forms.Form):
    def __init__(self, *args, **kwargs):
        attribute_group = kwargs.pop('attribute_group')
        super(GroupForm, self).__init__(*args, **kwargs)

        attributes = Attribute.objects.filter(attribute_group=attribute_group)

        for attr in attributes:
            if attr.result_type == 'Integer':
                self.fields[attr.name] = forms.IntegerField()

            elif attr.result_type == 'Decimal':
                self.fields[attr.name] = forms.DecimalField(decimal_places=2, max_digits=9)

            elif attr.result_type == 'Text':
                self.fields[attr.name] = forms.CharField(max_length=100)

            elif attr.result_type == 'DropDown':
                attributeoptions = AttributeOption.objects.filter(attribute_id=attr.id).order_by('position')
                criteria_information = []
                for attropt in attributeoptions:
                    criteria_information.append(
                        '<b>%s</b></br>%s<br>' % (attropt.option, attropt.description.replace('"', '\''))
                    )

                self.fields[attr.name] = forms.ChoiceField(
                    choices=[(attropt.value, attropt.option) for attropt in attributeoptions],
                    label='<b>%s</b> <span class="question-mark" help="%s">?<span>' % (
                        attr.name, '<br>'.join(criteria_information)
                    )
                )

            elif attr.result_type == 'MultipleChoice':
                attributeoptions = AttributeOption.objects.filter(attribute_id=attr.id).order_by('position')

                self.fields[attr.name] = forms.MultipleChoiceField(
                    choices=[(attropt.value, attropt.option) for attropt in attributeoptions],
                )


class Group(object):
    def __init__(self, name, group_form):
        self.name = name
        self.group_form = group_form


class AttributeForm(forms.Form):
    feature_uuid = forms.CharField(max_length=100)
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
