from django.urls import path

from .views import ExportData

urlpatterns = (
    path('export/<str:export_type>', ExportData.as_view(), name='exports.export'),
)
