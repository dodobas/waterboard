# -*- coding: utf-8 -*-

from __future__ import absolute_import, division, print_function, unicode_literals

from .project import *  # noqa
from .utils import generate_logfilename

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
# Changes for live site
# ['*'] for testing but not for production

ALLOWED_HOSTS = ['*']

# Comment if you are not running behind proxy
USE_X_FORWARDED_HOST = True

# Set debug to false for production
DEBUG = False
TEMPLATES[0]['OPTIONS']['debug'] = DEBUG

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'docker',
        'USER': 'docker',
        'PASSWORD': 'docker',
        'HOST': 'db',
        # Set to empty string for default.
        'PORT': '5432',
    }
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        # define output formats
        'verbose': {
            'format': (
                '%(levelname)s %(name)s %(asctime)s %(module)s %(process)d '
                '%(thread)d %(message)s')
        },
        'simple': {
            'format': (
                '%(name)s %(levelname)s %(filename)s L%(lineno)s: '
                '%(message)s')
        },
    },
    'handlers': {
        'logfile': {
            'class': 'logging.FileHandler',
            'filename': generate_logfilename('/data/logs'),
            'formatter': 'verbose',
            'level': 'INFO',
        }
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['logfile'],
            'level': 'INFO',  # switch to DEBUG to show actual SQL
        },
        'django': {
            'handlers': ['logfile'],
            'level': 'INFO'
        }
    },
    # root logger
    # non handled logs will propagate to the root logger
    'root': {
        'handlers': ['logfile'],
        'level': 'INFO'
    }
}

CLUSTER_CACHE_DIR = '/data/cache'
MEDIA_ROOT = '/data/media'
STATIC_ROOT = '/data/static'

BROKER_URL = 'amqp://guest:guest@rabbitmq:5672//'
