# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import DifferenceViewer

urlpatterns = (
    url(r'^difference_viewer', DifferenceViewer.as_view(), name='difference_viewer'),
)
