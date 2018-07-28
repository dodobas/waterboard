from django.conf.urls import url

from .views import AttributeOptionsList

# r'^feature-by-uuid
urlpatterns = (
    url(
        r'^attributes/filter/options$', AttributeOptionsList.as_view(), name='attributes.filter.options'
    ),
)
