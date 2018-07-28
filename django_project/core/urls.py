from django.conf import settings
from django.conf.urls import url
from django.contrib import admin
from django.contrib.staticfiles import views
from django.urls import include, re_path

urlpatterns = (
    # Enable the admin:
    url(r'^admin-control/', include(admin.site.urls)),
    url(r'^', include('webusers.urls', namespace='webusers')),
    url(r'^', include('features.urls', namespace='features')),
    url(r'^', include('dashboards.urls', namespace='dashboards')),
    url(r'^', include('tablereports.urls', namespace='tablereports')),
    url(r'^', include('attributes.urls', namespace='attributes')),
    url(r'^', include('exports.urls', namespace='exports')),
    url(r'^api/', include('apis.urls', namespace='api')),
    url(r'^', include('imports.urls', namespace='imports')),
    url(r'^', include('changesets.urls', namespace='changesets')),
    url(r'^', include('feature_diff.urls', namespace='feature_diff')),
)

# expose static files and uploaded media if DEBUG is active
if settings.DEBUG:
    urlpatterns += (
        re_path(r'^media/(?P<path>.*)$', views.serve, {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
        re_path(r'^static/(?P<path>.*)$', views.serve, {'document_root': settings.STATIC_ROOT, 'show_indexes': True})
    )
