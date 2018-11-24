# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import itertools

from django import forms

from .models import Attribute, AttributeGroup


class GroupForm(forms.Form):
    def __init__(self, attribute_group, webuser, *args, **kwargs):
        self.group_label = attribute_group.label
        self.group_key = attribute_group.key

        super().__init__(*args, **kwargs)

        attributes = (
            Attribute.objects
            .filter(attribute_group=attribute_group)
            .order_by('attribute_group__position', 'position')
        )

        for attr in attributes:
            if attr.result_type == 'Integer':
                self.fields[attr.key] = forms.IntegerField(label=attr.label, required=attr.required, widget=forms.TextInput)

            elif attr.result_type == 'Decimal':
                self.fields[attr.key] = forms.DecimalField(label=attr.label, decimal_places=8, required=attr.required, widget=forms.TextInput)

            elif attr.result_type == 'Text':
                self.fields[attr.key] = forms.CharField(label=attr.label, max_length=512, required=attr.required)

            elif attr.result_type == 'DropDown':
                self.fields[attr.key] = forms.CharField(
                    label=attr.label,
                    max_length=512, required=attr.required,
                    widget=forms.TextInput(attrs={'wb-selectize': 'field-for-selectize'}),
                )


class BaseAttributeForm(forms.Form):

    def __init__(self, webuser, *args, **kwargs):
        super().__init__(*args, **kwargs)
        group_data = self.group_attributes(kwargs)

        self.groups = []

        for attribute_group in AttributeGroup.objects.order_by('position').all():
            form_kwargs = dict(initial=self.initial, attribute_group=attribute_group, webuser=webuser)

            if group_data:
                form_kwargs.update(data=group_data.get(attribute_group.key, {}))

            group_form = GroupForm(**form_kwargs)

            self.groups.append(group_form)

    @staticmethod
    def group_attributes(kwargs):
        group_data = {}

        if 'data' in kwargs:

            attributes = Attribute.objects.select_related('attribute_group').order_by('attribute_group__position').all()

            for attribute in attributes:

                group_label = attribute.attribute_group.key

                if group_label not in group_data:
                    group_data[group_label] = {}

                group_data[group_label].update({attribute.key: kwargs['data'].get(attribute.key, None)})

        return group_data

    def full_clean(self):
        # clean main form
        super().full_clean()

        # also clean all group forms
        for group in self.groups:
            group.full_clean()

    def is_valid(self):

        # main form (_feature_uuid, ...)
        main_form = [self.is_bound and not self.errors]
        # group forms
        group_forms = [form.is_bound and not form.errors for form in self.groups]

        # check if all forms are valid
        return all(itertools.chain(main_form, group_forms))


class UpdateFeatureForm(BaseAttributeForm):
    _feature_uuid = forms.CharField(max_length=100, widget=forms.HiddenInput())


class CreateFeatureForm(BaseAttributeForm):
    pass
