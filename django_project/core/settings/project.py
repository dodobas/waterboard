# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import os

from .celery_settings import *  # noqa

# Project apps
INSTALLED_APPS += (
    'attributes',
    'webusers',
    'features',
    'dashboards',
    'tablereports',
    'exports',
    'imports',
    'changesets',
    'feature_diff',
)

DEBUG = True

# reports directory
REPORTS_DIRECTORY = os.path.join(MEDIA_ROOT, 'reports')


AUTH_USER_MODEL = 'webusers.WebUser'

LOGIN_URL = '/login'

START_PAGE_URL = 'dashboards:index'
