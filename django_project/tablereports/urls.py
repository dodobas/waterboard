from django.conf.urls import url

from .views import TableDataView, TableReportView

urlpatterns = (
    url(
        r'^table-report$', TableReportView.as_view(), name='table.reports.view'
    ),
    url(
        r'^table-data$', TableDataView.as_view(), name='table.data.view'
    )
)
