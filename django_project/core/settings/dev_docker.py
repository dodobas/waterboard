# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from .dev import *  # noqa

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

GEOS_LIBRARY_PATH = '/usr/lib/libgeos_c.so.1'

POSTGIS_VERSION = (2, 3, 0)
