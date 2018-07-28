from django.conf.urls import url

from .views import ExportData

urlpatterns = (
    url(
        r'^export/(?P<export_type>\w+)$', ExportData.as_view(), name='exports.export'
    ),
)
