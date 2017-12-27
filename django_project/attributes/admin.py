# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin
from .models import AttributeGroup, Attribute, AttributeOption


class AttributeGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'position')
    ordering = ('position',)


class AttributeAdmin(admin.ModelAdmin):
    list_display = ('name', 'attribute_group', 'result_type')
    ordering = ('attribute_group', 'name')


class AttributeOptionAdmin(admin.ModelAdmin):
    list_display = ('attribute', 'option', 'value', 'description', 'position')
    ordering = ('attribute', 'position')


admin.site.register(AttributeGroup, AttributeGroupAdmin)
admin.site.register(Attribute, AttributeAdmin)
admin.site.register(AttributeOption, AttributeOptionAdmin)
