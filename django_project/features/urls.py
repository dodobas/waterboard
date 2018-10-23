from django.urls import path

from features.views import FeatureByUUID, FeatureCreate, FeatureForChangeset, UpdateFeature

app_name = 'features'

urlpatterns = (
    path('feature-by-uuid/<uuid:feature_uuid>/', FeatureByUUID.as_view(), name='update-feature'),
    path('feature-create/', FeatureCreate.as_view(), name='create-feature'),
    path('update-feature/<uuid:pk>', UpdateFeature.as_view(), name='update-feature'),
    path(
        'feature-by-uuid/<uuid:feature_uuid>/<int:changeset_id>/',
        FeatureForChangeset.as_view(), name='feature-changeset'
    )
)
