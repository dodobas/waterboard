# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import CSVDownload, SHPDownload, TableDataView, TableReportView

urlpatterns = (
    url(
        r'^table-report$', TableReportView.as_view(), name='table.reports.view'
    ),
    url(
        r'^table-data$', TableDataView.as_view(), name='table.data.view'
    ),
    url(
        r'^download-csv$', CSVDownload.as_view(), name='table.reports.csv_download'
    ),
    url(
        r'^download-shp$', SHPDownload.as_view(), name='table.reports.shp_download'
    ),
)
