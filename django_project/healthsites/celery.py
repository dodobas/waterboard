from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf import settings

from celery import Celery

app = Celery('event_mapper')

CELERY_TIMEZONE = settings.TIME_ZONE

app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
