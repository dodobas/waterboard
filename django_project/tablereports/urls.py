from django.urls import path

from .views import TableDataView, TableReportView

app_name = 'tablereports'

urlpatterns = (
    path('table-report/', TableReportView.as_view(), name='table.reports.view'),
    path('table-data/', TableDataView.as_view(), name='table.data.view')
)
