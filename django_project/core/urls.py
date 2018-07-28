from django.conf import settings
from django.contrib import admin
from django.contrib.staticfiles import views
from django.urls import include, path, re_path

urlpatterns = (
    # Enable the admin:
    path(r'^admin-control/', admin.site.urls),
    path(r'^', include('webusers.urls', namespace='webusers')),
    path(r'^', include('features.urls', namespace='features')),
    path(r'^', include('dashboards.urls', namespace='dashboards')),
    path(r'^', include('tablereports.urls', namespace='tablereports')),
    path(r'^', include('attributes.urls', namespace='attributes')),
    path(r'^', include('exports.urls', namespace='exports')),
    path(r'^api/', include('apis.urls', namespace='api')),
    path(r'^', include('imports.urls', namespace='imports')),
    path(r'^', include('changesets.urls', namespace='changesets')),
    path(r'^', include('feature_diff.urls', namespace='feature_diff')),
)

# expose static files and uploaded media if DEBUG is active
if settings.DEBUG:
    urlpatterns += (
        re_path(r'^media/(?P<path>.*)$', views.serve, {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
        re_path(r'^static/(?P<path>.*)$', views.serve, {'document_root': settings.STATIC_ROOT, 'show_indexes': True})
    )
