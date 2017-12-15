# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import patterns, url

from .views.healthsites_view import HealthsitesView
# from .views.healthsites_reports_view import HealthsitesReportsView

urlpatterns = patterns(
    '',
    # Event related urls
    url(r'^healthsites$', HealthsitesView.as_view(), name='healthsites_view'),
    url(r'^healthsites-reports$', 'healthsites.views.healthsites_reports_view.healthsites_reports', name='healthsites_reports_view'),

    url(r'^healthsites/cluster$', 'healthsites.views.healthsites_view.get_cluster', name='healthsites_cluster'),
    url(r'^healthsites/names', 'healthsites.views.healthsites_view.search_healthsites_name',
        name='search_healthsites_name'),
    url(r'^assessment/names', 'healthsites.views.healthsites_view.search_assessment_name',
        name='search_assessment_name'),
    url(r'^healthsites/search-name', 'healthsites.views.healthsites_view.search_name',
        name='search_healthsite_by_name'),
    url(r'^healthsites/update-assessment', 'healthsites.views.assessment_view.update_assessment',
        name='search_healthsite_by_name'),
    url(r'^assessment-reports/(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/(?P<day>[0-9]{2})',
        'healthsites.views.assessment_view.download_report',
        name='assessment-reports'),
    url(r'^healthsites/overall-assessments', 'healthsites.views.assessment_view.overall_assessments',
        name='overall-assessments'),
    url(r'^download_assessment_report/(?P<assessment_id>[0-9]+)/',
        'healthsites.views.reports.download_assessment_report',
        name='download_assessment_report'),
    url(r'^download_assessment_csv/(?P<assessment_id>[0-9]+)/',
        'healthsites.views.reports.download_assessment_csv',
        name='download_assessment_csv'),


    url(r'^show_event', 'healthsites.views.assessment_view.get_events', name='show_event'),

    url(r'^reports', 'healthsites.views.reports.reports', name='reports'),

    url(r'^download_report/(?P<report_id>[0-9A-Za-z_\-]+)/',
        'healthsites.views.reports.download_report',
        name='download_report'),
)
