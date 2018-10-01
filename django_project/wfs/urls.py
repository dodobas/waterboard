# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import WfsOperations

urlpatterns = (
    url(r'^wfs$', WfsOperations.as_view(), name='get_capabilities'),
)
