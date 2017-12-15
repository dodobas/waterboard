# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf import settings
from django.conf.urls import include, patterns, url
from django.contrib import admin

urlpatterns = patterns(
    '',
    # Enable the admin:
    url(r'^wk-admin/', include(admin.site.urls)),
    url(r'^', include('event_mapper.urls', namespace='event_mapper')),
    url(r'^', include('healthsites.urls', namespace='healthsites'))
)

# expose static files and uploaded media if DEBUG is active
if settings.DEBUG:
    urlpatterns += patterns(
        '',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve',
            {
                'document_root': settings.MEDIA_ROOT,
                'show_indexes': True
            }),
        url(r'', include('django.contrib.staticfiles.urls'))
    )
