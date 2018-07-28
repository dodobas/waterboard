from django.urls import path

from .views import AttributeOptionsList

# r'^feature-by-uuid
urlpatterns = (
    path('attributes/filter/options', AttributeOptionsList.as_view(), name='attributes.filter.options'),
)
