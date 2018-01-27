# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import DashboardsList, DashboardView

urlpatterns = (
    url(
        r'^$', DashboardView.as_view(), name='index'
    ),
    url(
        r'^data/$', DashboardsList.as_view(), name='dashborad.list',
    )
)
