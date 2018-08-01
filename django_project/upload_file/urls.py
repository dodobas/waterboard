# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import model_form_upload_file, insert_data

urlpatterns = (
    url(r'^upload_file$', model_form_upload_file, name='upload_file'),
    url(r'insert_data/(?P<obj_id>.*)$', insert_data, name='insert_data')
)
