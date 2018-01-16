# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib import admin

from .constants import CHOICE_ATTRIBUTE_OPTIONS, SIMPLE_ATTRIBUTE_OPTIONS
from .models import AttributeGroup, AttributeOption, ChoiceAttribute, SimpleAttribute


class AttributeGroupAdmin(admin.ModelAdmin):
    list_display = ('label', 'position')
    fields = ('label', 'position')
    ordering = ('position',)


class SimpleAttributeAdmin(admin.ModelAdmin):
    list_display = ('label', 'attribute_group', 'result_type', 'required', 'searchable', 'orderable')
    fields = ('attribute_group', 'label', 'result_type', 'position', 'required', 'searchable', 'orderable')
    list_filter = ('attribute_group', 'required', 'searchable', 'orderable')
    ordering = ('attribute_group', 'label')

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name == 'result_type':
            kwargs['choices'] = SIMPLE_ATTRIBUTE_OPTIONS
        return super(SimpleAttributeAdmin, self).formfield_for_choice_field(db_field, request, **kwargs)


class AttributeOptionInline(admin.StackedInline):
    model = AttributeOption
    extra = 1


class ChoiceAttributeAdmin(admin.ModelAdmin):
    list_display = ('label', 'attribute_group', 'result_type', 'required', 'searchable', 'orderable')
    fields = ('attribute_group', 'label', 'result_type', 'position', 'required', 'searchable', 'orderable')
    list_filter = ('attribute_group', 'required', 'searchable', 'orderable')
    ordering = ('attribute_group', 'label')

    inlines = (AttributeOptionInline, )

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name == 'result_type':
            kwargs['choices'] = CHOICE_ATTRIBUTE_OPTIONS
        return super(ChoiceAttributeAdmin, self).formfield_for_choice_field(db_field, request, **kwargs)


admin.site.register(AttributeGroup, AttributeGroupAdmin)
admin.site.register(SimpleAttribute, SimpleAttributeAdmin)
admin.site.register(ChoiceAttribute, ChoiceAttributeAdmin)
