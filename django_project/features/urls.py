from django.urls import path

from features.views import FeatureByUUID, FeatureCreate

app_name = 'features'

urlpatterns = (
    path('feature-by-uuid/<uuid:feature_uuid>/', FeatureByUUID.as_view(), name='update-feature'),
    path('feature-create/', FeatureCreate.as_view(), name='create-feature')
)
