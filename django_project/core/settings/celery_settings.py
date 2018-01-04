# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from celery.schedules import crontab

from .contrib import *  # noqa

CELERY_BROKER_URL = 'redis://{redis_host}:{redis_port}/{redis_db}'.format(
    redis_host='redis', redis_port=6379, redis_db=3
)
CELERY_BROKER_TRANSPORT_OPTIONS = {'socket_timeout': 5}

# JSON serializer is more safe than pickle, json will be default for celery 3.2
# JSON is safe to use between multiple programing languages, pickle only works
# with Python, but we have limited set of supported data types
# https://celery.readthedocs.org/en/latest/userguide/calling.html#serializers
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

# make sure we only accept json serialized content
CELERY_ACCEPT_CONTENT = ['json']

# we don't really care about the task results, but there might be tasks which do
# require to keep results, we can set this per task if required
CELERY_TASK_IGNORE_RESULT = True

# use simple rabbitmq base result backend
CELERY_RESULT_BACKEND = None
CELERY_RESULT_PERSISTENT = False

CELERY_TIMEZONE = 'UTC'
CELERY_ENABLE_UTC = True

# we want to keep any loggers that might have been setup
CELERY_WORKER_HIJACK_ROOT_LOGGER = False

# useful with long running tasks
# https://celery.readthedocs.org/en/latest/configuration.html#celeryd-prefetch-multiplier
CELERY_WORKER_PREFETCH_MULTIPLIER = 1

# only acknowledge tasks after they have been executed
# https://celery.readthedocs.org/en/latest/configuration.html#celery-acks-late
CELERY_TASK_ACKS_LATE = True

CELERY_BEAT_SCHEDULE = {
    'daily-report': {
        'task': 'tasks.daily_report',
        'schedule': crontab(hour=18, minute=0),
    },
    'daily-assessment-report': {
        'task': 'tasks.daily_assessment_report',
        'schedule': crontab(hour=0, minute=0),
    },
}
