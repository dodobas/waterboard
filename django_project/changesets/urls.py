# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import ChangesetReportView, ChangesetsExplorerView

urlpatterns = (
    url(r'^changeset_explorer$', ChangesetsExplorerView.as_view(), name='changeset_explorer'),
    url(r'^changeset_report/(?P<changeset_id>.*)$', ChangesetReportView.as_view(), name='changeset_report'),
)
