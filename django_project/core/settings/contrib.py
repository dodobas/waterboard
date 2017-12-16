# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from .base import *  # NOQA

# Extra installed apps
INSTALLED_APPS += (
    'raven.contrib.django.raven_compat',  # enable Raven plugin
    'pipeline',
    'celery',
    'django_forms_bootstrap'
)


MIDDLEWARE_CLASSES += (
    'django.middleware.gzip.GZipMiddleware',
)
TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.request',
    'django.contrib.messages.context_processors.messages',
    'django.core.context_processors.media',
)

LEAFLET_CONFIG = {
    'TILES': [
        (
            'OpenStreetMap',
            'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
            ('© <a href="http://www.openstreetmap.org" '
             'target="_parent">OpenStreetMap</a> and contributors, under an '
             '<a href="http://www.openstreetmap.org/copyright" '
             'target="_parent">open license</a>')
        )]

}

# enable cached storage - requires uglify.js (node.js)
STATICFILES_STORAGE = 'pipeline.storage.PipelineCachedStorage'

# bad bad bad Javascript
PIPELINE_DISABLE_WRAPPER = True

PIPELINE_JS = {
    'contrib': {
        'source_filenames': (
            'js/jquery-1.11.2.js',
            'js/libs/jquery-ui.js',
            'js/bootstrap.js',
            'js/bootstrap-multiselect.js',
            'js/moment.js',
            'js/bootstrap-datetimepicker.js',
            'js/csrf-ajax.js',
            'js/libs/leaflet/leaflet.js',
            'js/libs/leaflet/Leaflet.Editable.js',
        ),
        'output_filename': 'js/contrib.js',
    },
    'event_mapper_js': {
        'source_filenames': (
            'js/Chart.js',
            'js/event_mapper.js',
            'js/add_event.js',
            'js/event_dashboard.js',
            'js/update_movement.js',

            'js/wb.utils.js'
        ),
        'output_filename': 'js/event_mapper_js.js'
    }
}

PIPELINE_CSS = {
    'contrib': {
        'source_filenames': (
            'css/bootstrap.css',
            'css/bootstrap-datetimepicker.css',
        ),
        'output_filename': 'css/contrib.css',
        'extra_context': {
            'media': 'screen, projection',
        }
    },
    'event_mapper_css': {
        'source_filenames': (
            'js/lib/leaflet/leaflet.css',
            'css/jquery-ui.css',
            'css/event_mapper.css',
        ),
        'output_filename': 'css/event_mapper_css.css',
    }
}
