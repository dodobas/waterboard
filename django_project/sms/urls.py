from django.conf.urls import patterns, url

import views

urlpatterns = patterns('',
    url('^status_postback/$', views.update_delivery_status, name='status_postback'),
    url('^reply_postback/$', views.handle_reply, name='reply_postback'),
    url('^status/([0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12})/$', views.get_message_set_status, name='messageset-status'),
)