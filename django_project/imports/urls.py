# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import ImportData, InsertData, ImportHistory, FileHistory

urlpatterns = (
    url(r'^import_data$', ImportData.as_view(), name='import_data'),
    url(r'^insert_data/(?P<obj_id>.*)$', InsertData.as_view(), name='insert_data'),
    url(r'^import_history$', ImportHistory.as_view(), name='import_history'),
    url(r'^file_history/(?P<file_id>.*)$', FileHistory.as_view(), name='file_history')
)
