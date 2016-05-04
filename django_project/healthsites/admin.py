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


admin.site.register(Healthsite, HealthsiteAdmin)
admin.site.register(AssessmentCriteria, admin.ModelAdmin)
admin.site.register(AssessmentGroup, admin.ModelAdmin)
admin.site.register(ResultOption, admin.ModelAdmin)
