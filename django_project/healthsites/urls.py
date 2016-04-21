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

from healthsites.views.add_assessment import AddAssessment


urlpatterns = patterns(
    '',
    # Event related urls
    url(r'^healthsite', AddAssessment.as_view(), name='add_assessment'),
)
