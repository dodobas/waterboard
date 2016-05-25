__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '21/04/16'

# coding=utf-8
from django.contrib.gis import admin
from django.contrib.auth.admin import UserAdmin
from healthsites.models.healthsite import Healthsite
from healthsites.models.assessment import (
    AssessmentCriteria, AssessmentGroup,
    ResultOption)


class HealthsiteAdmin(admin.ModelAdmin):
    list_display = ('name', 'version', 'date')


class AssessmentCriteriaAdmin(admin.ModelAdmin):
    list_display = ('name', 'assessment_group', 'result_type')
    ordering = ('assessment_group',)


class AssessmentGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'order')
    ordering = ('order',)


class ResultOptionAdmin(admin.ModelAdmin):
    list_display = ('assessment_criteria', 'option', 'value', 'order')
    ordering = ('assessment_criteria', 'order')


admin.site.register(Healthsite, HealthsiteAdmin)
admin.site.register(AssessmentCriteria, AssessmentCriteriaAdmin)
admin.site.register(AssessmentGroup, AssessmentGroupAdmin)
admin.site.register(ResultOption, ResultOptionAdmin)
