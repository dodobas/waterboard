# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import change_password, login, logout, profile

urlpatterns = (
    # User related urls
    url(r'^login$', login, name='login'),
    url(r'^logout$', logout, name='logout'),
    url(r'^profile$', profile, name='profile'),
    url(r'^change_password', change_password, name='change_password')
)
