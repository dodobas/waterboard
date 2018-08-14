from django.conf.urls import url

from .views import FeatureSpec

urlpatterns = (
    url(
        r'^feature/(?P<feature_uuid>[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12})',
        FeatureSpec.as_view(), name='feature-spec'
    ),
)
