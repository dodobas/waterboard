from django.urls import path

from .views import FeatureSpec, CreateFeature, UpdateFeature, NewFeature

app_name = 'apis'

urlpatterns = (
    path('feature/<uuid:feature_uuid>/', FeatureSpec.as_view(), name='feature-spec'),
    path('new-feature/', NewFeature.as_view(), name='new-feature'),
    path('create-feature/<uuid:feature_uuid>/', CreateFeature.as_view(), name='create-feature'),
    path('update-feature/<uuid:feature_uuid>/', UpdateFeature.as_view(), name='update-feature')
)
