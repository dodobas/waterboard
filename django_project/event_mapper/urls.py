# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'urls'
__date__ = '3/27/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

"""URI Routing configuration for this apps."""
from django.conf.urls import patterns, url

urlpatterns = patterns(
    '',
    url(r'^$', 'event_mapper.views.event.event_dashboard', name='index'),

    # User related urls
    url(r'^login$', 'event_mapper.views.user.login', name='login'),
    url(r'^forgot-password', 'event_mapper.views.user.forgot_password', name='forgot_password'),
    url(r'^logout$', 'event_mapper.views.user.logout', name='logout'),
    url(r'^register$', 'event_mapper.views.user.register',
        name='register'),
    url(r'^account-confirmation/(?P<uid>[0-9A-Za-z_\-]+)/(?P<key>.+)/$',
        'event_mapper.views.user.confirm_registration',
        name='confirm_registration'),
    url(r'^profile$', 'event_mapper.views.user.profile', name='profile'),
    url(r'^change_password', 'event_mapper.views.user.change_password',
        name='change_password'),

    # Event related urls
    url(r'^alert', 'event_mapper.views.event.add_event', name='add_event'),
    url(r'^show_event', 'event_mapper.views.event.get_events',
        name='show_event'),

    # Movement related urls
    url(r'^update_movement', 'event_mapper.views.movement.update_movement',
        name='update_movement'),
    url(r'^get_country', 'event_mapper.views.movement.get_country',
        name='get_country'),
    url(r'^get_province', 'event_mapper.views.movement.get_province',
        name='get_province'),

    # Static page urls
    url(r'^contact', 'event_mapper.views.front_end.contact', name='contact'),

    url(r'^reports', 'event_mapper.views.reports.reports', name='reports'),

    url(r'^download_report/(?P<report_id>[0-9A-Za-z_\-]+)/',
        'event_mapper.views.reports.download_report',
        name='download_report'),
)
