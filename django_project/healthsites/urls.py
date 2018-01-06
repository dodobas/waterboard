# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views.assessment_view import download_assesment_report_pdf, get_events, overall_assessments
from .views.healthsites_reports_view import TableReportView
from .views.healthsites_view import get_cluster, search_assessment_name, search_healthsites_name, search_name
from .views.index import event_dashboard
from .views.reports import download_assessment_csv, download_assessment_report, download_report, reports

urlpatterns = (
    # TODO use class based views
    url(
        r'^healthsites-table-reports$',
        TableReportView.as_view(),
        name='table.reports.view'
    ),

    url(r'^healthsites/cluster$', get_cluster, name='healthsites_cluster'),
    url(r'^healthsites/names', search_healthsites_name, name='search_healthsites_name'),
    url(r'^assessment/names', search_assessment_name, name='search_assessment_name'),
    url(r'^healthsites/search-name', search_name, name='search_healthsite_by_name'),
    url(
        r'^assessment-reports/(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/(?P<day>[0-9]{2})',
        download_assesment_report_pdf, name='assessment-reports'
    ),
    url(r'^healthsites/overall-assessments', overall_assessments, name='overall-assessments'),
    url(
        r'^download_assessment_report/(?P<assessment_id>[0-9]+)/',
        download_assessment_report, name='download_assessment_report'
    ),
    url(
        r'^download_assessment_csv/(?P<assessment_id>[0-9]+)/',
        download_assessment_csv, name='download_assessment_csv'
    ),

    url(r'^show_event', get_events, name='show_event'),

    url(r'^reports', reports, name='reports'),

    url(r'^download_report/(?P<report_id>[0-9A-Za-z_\-]+)/', download_report, name='download_report')
)
