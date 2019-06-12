from django.urls import path, include

from .views import (
    FeatureSpec, CreateFeature, UpdateFeature, FeatureSpecForChangeset, FeatureHistory, DeleteFeature,
    AttributesSpec, TableReport, DownloadAttachment, DeleteAttachment,
    EmptyFeature, ExportSpec
)

app_name = 'apis'

v1_urlpatterns = [
    path(
        'feature/<uuid:feature_uuid>/<int:changeset_id>/', FeatureSpecForChangeset.as_view(),
        name='feature-spec-changeset'
    ),
    path('feature/<uuid:feature_uuid>/', FeatureSpec.as_view(), name='feature-spec'),
    path('create-feature/', EmptyFeature.as_view(), name='empty-feature'),
    path('create-feature/<uuid:feature_uuid>/', CreateFeature.as_view(), name='create-feature'),
    path('delete-feature/<uuid:feature_uuid>/', DeleteFeature.as_view(), name='delete-feature'),
    path('update-feature/<uuid:feature_uuid>/', UpdateFeature.as_view(), name='update-feature'),
    path('feature-history/<uuid:feature_uuid>/', FeatureHistory.as_view(), name='feature-history'),

    path('attributes/', AttributesSpec.as_view(), name='attributes-spec'),
    path('tablereport/', TableReport.as_view(), name='table-report'),

    path('attachments/<uuid:attachment_uuid>/', DownloadAttachment.as_view(), name='download-attachment'),
    path('delete-attachment/<uuid:attachment_uuid>/', DeleteAttachment.as_view(), name='delete-attachment'),

    path('export/', ExportSpec.as_view(), name='export-spec')
]


urlpatterns = (
    path('v1/', include(v1_urlpatterns)),
)
