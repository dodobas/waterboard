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
        'NAME': os.environ['PGDATABASE'],
        'USER': os.environ['PGUSER'],
        'PASSWORD': os.environ['PGPASSWORD'],
        'HOST': os.environ['PGHOST'],
        # Set to empty string for default.
        'PORT': os.environ['PGPORT'],
    }
}


CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'redis://{os.environ["REDISHOST"]}:{os.environ["REDISPORT"]}/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SERIALIZER': 'django_redis.serializers.json.JSONSerializer',
            'SOCKET_CONNECT_TIMEOUT': 5,  # in seconds
            'SOCKET_TIMEOUT': 5,  # in seconds
        }
    },
    'sessions': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'redis://{os.environ["REDISHOST"]}:{os.environ["REDISPORT"]}/2',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SERIALIZER': 'django_redis.serializers.json.JSONSerializer',
            'SOCKET_CONNECT_TIMEOUT': 5,  # in seconds
            'SOCKET_TIMEOUT': 5,  # in seconds
        }
    }
}


# Session storage
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'sessions'


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
            'filename': generate_logfilename('/srv/live/logs'),
            'formatter': 'verbose',
            'level': 'INFO',
        },
        'sentry': {
            'level': 'ERROR',  # To capture more than ERROR, change to WARNING, INFO, etc.
            'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['logfile'],
            'level': 'INFO',  # switch to DEBUG to show actual SQL
        },
        'django': {
            'handlers': ['logfile'],
            'level': 'INFO'
        },
        'raven': {
            'level': 'INFO',
            'handlers': ['logfile'],
            'propagate': False,
        },
    },
    # root logger
    # non handled logs will propagate to the root logger
    'root': {
        'handlers': ['logfile', 'sentry'],
        'level': 'INFO'
    }
}


# Sentry configuration
RAVEN_CONFIG = {
    'dsn': os.environ['SENTRY_DSN'],
    # If you are using git, you can also automatically configure the
    # release based on the git info.
    'release': os.environ['SERVICE_RELEASE']
}

# set default storage to minio
DEFAULT_FILE_STORAGE = "minio_storage.storage.MinioMediaStorage"
# STATICFILES_STORAGE = "minio_storage.storage.MinioStaticStorage"

MINIO_STORAGE_USE_HTTPS = True
