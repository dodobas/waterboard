# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from .dev import *  # noqa

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'waterboard',
        'USER': 'knek',
        'PASSWORD': 'knek',
        'HOST': 'localhost',
        'PORT': 5445
    }
}
ALLOWED_HOSTS = ['*']
RAVEN_CONFIG = {
}

# GDAL_LIBRARY_PATH = r'C:\Program Files\GDAL\gdal203'
# DEBUG = False
