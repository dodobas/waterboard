# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import DifferenceViewer

urlpatterns = (
    url(
        (r'^difference_viewer/'
         r'(?P<feature_uuid>[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12})/'
         r'(?P<changeset_id1>.*)/(?P<changeset_id2>.*)/$'),
        DifferenceViewer.as_view(), name='difference_viewer'
    ),

    url(
        (r'^difference_viewer/'
         r'(?P<feature_uuid>[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12})/$'),
        DifferenceViewer.as_view(), name='difference_viewer_no_changesets'
    ),
)
