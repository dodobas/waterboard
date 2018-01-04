# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import AttributesView, UpdateFeature

urlpatterns = (
    url(r'^healthsites$', AttributesView.as_view(), name='healthsites_view'),
    url(
        r'^update-feature/(?P<pk>[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12})',
        UpdateFeature.as_view(), name='update-feature'),
)
