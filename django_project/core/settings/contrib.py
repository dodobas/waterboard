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

# enable cached storage
STATICFILES_STORAGE = 'pipeline.storage.PipelineCachedStorage'


PIPELINE = {
    # Don't actually try to compress with pipeline
    'CSS_COMPRESSOR': 'pipeline.compressors.NoopCompressor',
    'JS_COMPRESSOR': 'pipeline.compressors.NoopCompressor',
    # bad bad bad Javascript
    'DISABLE_WRAPPER': True,

    'JAVASCRIPT': {
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
                'js/wb.utils.js'
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
            ),
            'output_filename': 'js/event_mapper_js.js'
        },
        'table_data_report': {
            'source_filenames': (
                'js/wb.table-report.js',
                'js/event_mapper.js',
            ),
            'output_filename': 'js/table_data_report.js'
        }
    },
    'STYLESHEETS': {
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
                'css/material-wfont.min.css',
                'css/event_mapper.css',
            ),
            'output_filename': 'css/event_mapper_css.css',
        }
    }
}
