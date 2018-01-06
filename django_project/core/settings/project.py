# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import os

from .celery_settings import *  # noqa

# Project apps
INSTALLED_APPS += (
    'attributes',
    'healthsites',
    'country',
    'webusers',
    'features'
)

DEBUG = True

# Cache folder
CLUSTER_CACHE_DIR = 'healthsites/cache'
CLUSTER_CACHE_MAX_ZOOM = 5

# reports directory
REPORTS_DIRECTORY = os.path.join(MEDIA_ROOT, 'reports')


AUTH_USER_MODEL = 'webusers.WebUser'

LOGIN_URL = '/login'

START_PAGE_URL = 'index'

PG_UTILS_SCHEMA = 'core_utils'
