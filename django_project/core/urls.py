from django.conf import settings
from django.contrib import admin
from django.conf.urls.static import static
from django.urls import include, path

app_name = 'core'

urlpatterns = (
    # Enable the admin:
    path('admin-control/', admin.site.urls),
    path('api/', include('apis.urls')),
    path('', include('webusers.urls')),
    path('', include('features.urls')),
    path('', include('dashboards.urls')),
    path('', include('tablereports.urls')),
    path('', include('attributes.urls')),
    path('', include('exports.urls')),
    path('', include('imports.urls')),
    path('', include('changesets.urls')),
    path('', include('feature_diff.urls')),
)

# expose static files and uploaded media if DEBUG is active
if settings.DEBUG:
    urlpatterns += (
        *static(settings.STATIC_URL, document_root=settings.STATIC_ROOT, show_indexes=True),
        *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT, show_indexes=True)
    )
