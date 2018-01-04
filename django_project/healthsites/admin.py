# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.gis import admin

from healthsites.models.assessment import HealthsiteAssessment

from .models.daily_report import DailyReport
from .models.healthsite import Healthsite


class HealthsiteAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('name', 'point_geometry', 'version', 'uuid', 'is_healthsites_io')}),
        ('Latest Assessment', {
            'fields': ('assessment',),
        }),
    )
    list_display = ('name', 'version', 'date', 'is_healthsites_io')
    readonly_fields = ('version', 'uuid', 'assessment', 'is_healthsites_io')
    search_fields = ['name', ]

    def assessment(self, obj):
        output = ''
        if obj:
            dict = obj.get_assessment()
            if 'assessments' in dict:
                dict = dict['assessments']
                for key in sorted(dict.keys()):
                    row = '<b>%s</b> : <a>%s</a></br>' % (key.replace('_', ' '), dict[key])
                    output += row

        return output

    assessment.allow_tags = True


admin.site.register(Healthsite, HealthsiteAdmin)


class HealthsiteAssessmentAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'healthsite', 'reference_url', 'reference_file', 'created_date', 'data_captor', 'current',
        'overall_assessment')
    ordering = ('created_date', 'name')
    search_fields = ['name', ]

    def save_model(self, request, obj, form, change):
        if getattr(obj, 'author', None) is None:
            obj.data_captor = request.user
        obj.save()


class HealthsiteAssessmentEntryAdmin(admin.ModelAdmin):
    list_display = ('healthsite_assessment', 'assessment_criteria', 'selected_option')
    ordering = ('healthsite_assessment', 'assessment_criteria')


admin.site.register(HealthsiteAssessment, HealthsiteAssessmentAdmin)
admin.site.register(DailyReport, admin.ModelAdmin)
