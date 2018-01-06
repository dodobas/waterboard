# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin
from django.views.static import serve

urlpatterns = (
    # Enable the admin:
    url(r'^wk-admin/', include(admin.site.urls)),
    url(r'^', include('healthsites.urls', namespace='healthsites')),
    url(r'^', include('webusers.urls', namespace='webusers')),
    url(r'^', include('attributes.urls', namespace='attributes')),
    url(r'^', include('features.urls', namespace='features'))
)

# expose static files and uploaded media if DEBUG is active
if settings.DEBUG:
    urlpatterns += (
        url(r'^media/(?P<path>.*)$', serve,
            {
                'document_root': settings.MEDIA_ROOT,
                'show_indexes': True
            }),
        url(r'', include('django.contrib.staticfiles.urls'))
    )
