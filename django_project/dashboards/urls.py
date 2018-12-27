# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import DashboardsList, DashboardsMapData, DashboardsTableReport, DashboardView

urlpatterns = (
    url(
        r'^$', DashboardView.as_view(), name='index'
    ),
    url(
        r'^data/$', DashboardsList.as_view(), name='dashboard.list',
    ),
    url(
        r'^dashboard-tabledata/$', DashboardsTableReport.as_view(), name='dashboard.tablelist',
    ),
    url(
        r'^dashboard-mapdata/$', DashboardsMapData.as_view(), name='dashboard.mapcluster',
    )
)
