# -*- coding: utf-8 -*-
from .contrib import *  # noqa

from celery.schedules import crontab


#
# RABBIT_HOSTNAME = os.environ.get('RABBITMQ_PORT_5672_TCP', 'localhost:5672')
# if RABBIT_HOSTNAME.startswith('tcp://'):
#     RABBIT_HOSTNAME = RABBIT_HOSTNAME.split('//')[1]

# BROKER_URL = 'amqp://%s:%s@%s//' % (
#     'admin',  # os.environ['RABBIT_ENV_USER'],
#     'BU9QWf0P5nsR',  # os.environ['RABBITMQ_ENV_RABBIT_PASSWORD'],
#     RABBIT_HOSTNAME)

# We don't want to have dead connections stored on rabbitmq
# BROKER_HEARTBEAT = '?heartbeat=30'
# BROKER_URL += BROKER_HEARTBEAT

BROKER_URL = 'amqp://guest:guest@%s:5672//' % os.environ.get('RABBITMQ_HOST', 'rabbitmq')

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
CELERY_IGNORE_RESULT = True

# use simple rabbitmq base result backend
CELERY_RESULT_BACKEND = 'rpc://'
CELERY_RESULT_PERSISTENT = False

CELERY_TIMEZONE = 'UTC'
CELERY_ENABLE_UTC = True

# we want to keep any loggers that might have been setup
CELERYD_HIJACK_ROOT_LOGGER = False

# useful with long running tasks
# https://celery.readthedocs.org/en/latest/configuration.html#celeryd-prefetch-multiplier
CELERYD_PREFETCH_MULTIPLIER = 1

# only acknowledge tasks after they have been executed
# https://celery.readthedocs.org/en/latest/configuration.html#celery-acks-late
CELERY_ACKS_LATE = True

CELERYBEAT_SCHEDULE = {
    'daily-report': {
        'task': 'tasks.daily_report',
        'schedule': crontab(hour=18, minute=0),
    },
    'daily-assessment-report': {
        'task': 'tasks.daily_assessment_report',
        'schedule': crontab(hour=0, minute=0),
    },
}
