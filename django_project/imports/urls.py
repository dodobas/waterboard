# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import ImportData, ImportDataTask, ImportHistory, TaskHistoryView

urlpatterns = (
    url(r'^import_data/(?P<task_id>.*)$', ImportDataTask.as_view(), name='insert_data'),
    url(r'^import_data$', ImportData.as_view(), name='import_data'),
    url(r'^import_history/(?P<task_id>.*)$', TaskHistoryView.as_view(), name='file_history'),
    url(r'^import_history$', ImportHistory.as_view(), name='import_history')
)
