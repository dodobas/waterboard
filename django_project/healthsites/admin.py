__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '21/04/16'

# coding=utf-8
from django.contrib.gis import admin
from healthsites.models.healthsite import Healthsite
from healthsites.models.assessment import (
    AssessmentCriteria, AssessmentGroup,
    ResultOption, HealthsiteAssessment, HealthsiteAssessmentEntryDropDown, HealthsiteAssessmentEntryInteger,
    HealthsiteAssessmentEntryReal)
from healthsites.models.daily_report import DailyReport


class HealthsiteAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('name', 'point_geometry', 'version', 'uuid')}),
        ('Latest Assessment', {
            'fields': ('assessment',),
        }),
    )
    list_display = ('name', 'version', 'date')
    readonly_fields = ('version', 'uuid', 'assessment')
    search_fields = ['name', ]

    def assessment(self, obj):
        output = ""
        if obj:
            dict = obj.get_assessment()
            if 'assessments' in dict:
                dict = dict['assessments']
                for key in sorted(dict.keys()):
                    row = "<b>%s</b> : <a>%s</a></br>" % (key.replace("_", " "), dict[key])
                    output += row

        return output

    assessment.allow_tags = True


class AssessmentCriteriaAdmin(admin.ModelAdmin):
    list_display = ('name', 'assessment_group', 'result_type')
    ordering = ('assessment_group', 'name')


class AssessmentGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'order')
    ordering = ('order',)


class ResultOptionAdmin(admin.ModelAdmin):
    list_display = ('assessment_criteria', 'option', 'value', 'order', 'description')
    ordering = ('assessment_criteria', 'order')


admin.site.register(Healthsite, HealthsiteAdmin)
admin.site.register(AssessmentCriteria, AssessmentCriteriaAdmin)
admin.site.register(AssessmentGroup, AssessmentGroupAdmin)
admin.site.register(ResultOption, ResultOptionAdmin)


class HealthsiteAssessmentAdmin(admin.ModelAdmin):
    list_display = (
        'healthsite', 'reference_url', 'reference_file', 'created_date', 'data_captor', 'current', 'overall_assessment')
    ordering = ('created_date', 'healthsite')

    def save_model(self, request, obj, form, change):
        if getattr(obj, 'author', None) is None:
            obj.data_captor = request.user
        obj.save()


class HealthsiteAssessmentEntryAdmin(admin.ModelAdmin):
    list_display = ('healthsite_assessment', 'assessment_criteria', 'selected_option')
    ordering = ('healthsite_assessment', 'assessment_criteria')


admin.site.register(HealthsiteAssessment, HealthsiteAssessmentAdmin)
admin.site.register(HealthsiteAssessmentEntryDropDown, HealthsiteAssessmentEntryAdmin)
admin.site.register(HealthsiteAssessmentEntryInteger, HealthsiteAssessmentEntryAdmin)
admin.site.register(HealthsiteAssessmentEntryReal, HealthsiteAssessmentEntryAdmin)

admin.site.register(DailyReport, admin.ModelAdmin)
