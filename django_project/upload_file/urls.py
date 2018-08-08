# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import model_form_upload_file, insert_data, upload_history, file_history

urlpatterns = (
    url(r'^upload_file$', model_form_upload_file, name='upload_file'),
    url(r'^insert_data/(?P<obj_id>.*)$', insert_data, name='insert_data'),
    url(r'^upload_history$', upload_history, name='upload_history'),
    url(r'^file_history/(?P<file_id>.*)$', file_history, name='file_history')
)
