from django.conf.urls import url
from django.urls import path

from .views import DifferenceViewer

app_name = 'feature_diff'

urlpatterns = (
    path(
        'difference_viewer/<uuid:feature_uuid>/<int:changeset_id1>/<int:changeset_id2>/',
        DifferenceViewer.as_view(), name='difference_viewer'
    ),
    path('difference_viewer/<uuid:feature_uuid>/', DifferenceViewer.as_view(), name='difference_viewer_no_changesets'),
)
