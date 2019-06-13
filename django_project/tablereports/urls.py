from django.urls import path

from .views import TableReportView

app_name = 'tablereports'

urlpatterns = (
    path('table-report/', TableReportView.as_view(), name='table.reports.view'),
)
