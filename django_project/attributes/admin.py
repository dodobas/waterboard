# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from urllib.parse import parse_qsl

from django.contrib import admin
from django import forms

from .constants import CHOICE_ATTRIBUTE_OPTIONS, SIMPLE_ATTRIBUTE_OPTIONS
from .models import AttributeGroup, AttributeOption, ChoiceAttribute, SimpleAttribute, Attribute


class AttributeGroupAdmin(admin.ModelAdmin):
    list_display = ('label', 'position')
    fields = ('label', 'position')
    ordering = ('position',)


class AttributeMixin:
    list_display = ('label', 'attribute_group', 'result_type', 'required', 'searchable', 'orderable')
    fields = ('attribute_group', 'label', 'result_type', 'position', 'required', 'searchable', 'orderable')
    list_filter = ('attribute_group', 'required', 'searchable', 'orderable')
    ordering = ('attribute_group', 'label')


class SimpleAttributeAdmin(AttributeMixin, admin.ModelAdmin):

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name == 'result_type':
            kwargs['choices'] = SIMPLE_ATTRIBUTE_OPTIONS
        return super(SimpleAttributeAdmin, self).formfield_for_choice_field(db_field, request, **kwargs)


class ChoiceAttributeAdmin(AttributeMixin, admin.ModelAdmin):

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name == 'result_type':
            kwargs['choices'] = CHOICE_ATTRIBUTE_OPTIONS
        return super(ChoiceAttributeAdmin, self).formfield_for_choice_field(db_field, request, **kwargs)


class AttributeOptionAddForm(forms.ModelForm):

    class Meta:
        model = AttributeOption
        fields = ()

    def __init__(self, *args, **kwargs):

        initial = kwargs.get('initial', {})

        if '_changelist_filters' in initial:
            changelist_filters = parse_qsl(initial.get('_changelist_filters'))
            attribute_id = [attr_id for key, attr_id in changelist_filters if key == 'attribute__id__exact'][0]
            if attribute_id:
                attribute_obj = Attribute.objects.get(id=attribute_id)
                kwargs['initial'].update({'attribute': attribute_obj})

        super(AttributeOptionAddForm, self).__init__(*args, **kwargs)


class AttributeOptionAdmin(admin.ModelAdmin):
    fields = ('attribute', 'option', 'value', 'description', 'position')
    list_filter = ('attribute', )
    list_display = ('attribute', 'option', 'value', 'description', 'position')
    ordering = ('attribute', 'position', 'option')
    list_select_related = ('attribute', )

    add_form = AttributeOptionAddForm


admin.site.register(AttributeGroup, AttributeGroupAdmin)
admin.site.register(SimpleAttribute, SimpleAttributeAdmin)
admin.site.register(ChoiceAttribute, ChoiceAttributeAdmin)
admin.site.register(AttributeOption, AttributeOptionAdmin)
