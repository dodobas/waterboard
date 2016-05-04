# coding=utf-8
"""Docstring for this file."""
__author__ = 'Christian Christelis <christian@kartoza.com>'
__project_name = 'watchkeeper'
__filename = 'urls'
__date__ = '10/04/16'
__copyright__ = 'kartoza.com'
__doc__ = ''

"""URI Routing configuration for this apps."""
from django.conf.urls import patterns, url

from healthsites.views.healthsites_view import HealthsitesView

urlpatterns = patterns(
    '',
    # Event related urls
    url(r'^healthsites$', HealthsitesView.as_view(), name='healthsites_view'),
    url(r'^healthsites/cluster$', 'healthsites.views.healthsites_view.get_cluster', name='healthsites_cluster'),
    url(r'^healthsites/names', 'healthsites.views.healthsites_view.search_healthsites_name',
        name='search_healthsites_name'),
    url(r'^healthsites/search-name', 'healthsites.views.healthsites_view.search_healthsite_by_name',
        name='search_healthsite_by_name'),
    url(r'^healthsites/add-assessment', 'healthsites.views.healthsites_view.search_healthsite_by_name',
        name='search_healthsite_by_name'),
)
