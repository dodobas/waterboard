# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib import admin

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


class AttributeOptionAdmin(admin.ModelAdmin):
    fields = ('attribute', 'option', 'value', 'description', 'position')
    list_filter = ('attribute', )
    list_display = ('attribute', 'option', 'value', 'description', 'position')
    ordering = ('attribute', 'position', 'option')
    list_select_related = ('attribute', )


admin.site.register(AttributeGroup, AttributeGroupAdmin)
admin.site.register(SimpleAttribute, SimpleAttributeAdmin)
admin.site.register(ChoiceAttribute, ChoiceAttributeAdmin)
admin.site.register(AttributeOption, AttributeOptionAdmin)
