# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import url

from .views import change_password, confirm_registration, forgot_password, login, logout, profile, register

urlpatterns = (
    # User related urls
    url(r'^login$', login, name='login'),
    url(r'^forgot-password', forgot_password, name='forgot_password'),
    url(r'^logout$', logout, name='logout'),
    url(r'^register$', register, name='register'),
    url(
        r'^account-confirmation/(?P<uid>[0-9A-Za-z_\-]+)/(?P<key>.+)/$',
        confirm_registration, name='confirm_registration'
    ),
    url(r'^profile$', profile, name='profile'),
    url(r'^change_password', change_password, name='change_password')
)
