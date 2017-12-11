# -*- coding: utf-8 -*-
from .dev import *  # noqa
import os

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'hcid_dev',
        'USER': 'dodobas',
        'PASSWORD': '',
        'HOST': 'postgresql',
        'PORT': 5433
    }
}

GOOGLE_MAPS_API_KEY = ''
