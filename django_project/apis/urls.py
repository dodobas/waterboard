from django.urls import path

from .views import FeatureSpec, CreateFeature, UpdateFeature, FeatureSpecForChangeset

app_name = 'apis'

urlpatterns = (
    path(
        'feature/<uuid:feature_uuid>/<int:changeset_id>/', FeatureSpecForChangeset.as_view(),
        name='feature-spec-changeset'
    ),
    path('feature/<uuid:feature_uuid>/', FeatureSpec.as_view(), name='feature-spec'),
    path('create-feature/', CreateFeature.as_view(), name='create-feature'),
    path('update-feature/<uuid:feature_uuid>/', UpdateFeature.as_view(), name='update-feature')
)
