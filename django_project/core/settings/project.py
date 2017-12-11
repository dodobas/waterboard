# -*- coding: utf-8 -*-
from .celery_setting import *  # noqa

DATABASES = {
    'default': {
        # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        # 'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        # Or path to database file if using sqlite3.
        'NAME': '',
        # The following settings are not used with sqlite3:
        'USER': '',
        'PASSWORD': '',
        # Empty for localhost through domain sockets or '127.0.0.1' for
        # localhost through TCP.
        'HOST': '',
        # Set to empty string for default.
        'PORT': '',
    }
}

# Project apps
INSTALLED_APPS += (
    'event_mapper',
    'healthsites',
    'notifications',
    'watchkeeper_settings',
    'sms',
)

DEBUG = True

# Cache folder
CLUSTER_CACHE_DIR = 'healthsites/cache'
CLUSTER_CACHE_MAX_ZOOM = 5
