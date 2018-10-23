from django.urls import path

from .views import ChangesetReportView, ChangesetsExplorerView

app_name = 'changesets'

urlpatterns = (
    path('changeset_explorer/', ChangesetsExplorerView.as_view(), name='changeset_explorer'),
    path('changeset_explorer/changeset_report/<int:changeset_id>/', ChangesetReportView.as_view(), name='changeset_report'),
)
