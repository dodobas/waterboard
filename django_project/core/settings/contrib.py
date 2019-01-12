from .base import *  # NOQA

# Extra installed apps
INSTALLED_APPS += (
    'raven.contrib.django.raven_compat',  # enable Raven plugin
    'pipeline',
    'django_forms_bootstrap',
    'leaflet',
    'minio_storage'
)

# enable cached storage
STATICFILES_STORAGE = 'pipeline.storage.PipelineCachedStorage'

# TODO cleanup after new dashboard is done
PIPELINE = {
    # Don't actually try to compress with pipeline
    'CSS_COMPRESSOR': 'pipeline.compressors.NoopCompressor',
    'JS_COMPRESSOR': 'pipeline.compressors.NoopCompressor',
    # bad bad bad Javascript
    'DISABLE_WRAPPER': True,

    'JAVASCRIPT': {
        'contrib': {
            'source_filenames': (
                'js/libs/promise-polyfill.min.js',
                'js/libs/lodash.min.js',
                'js/libs/d3.v5.min.js',
                'js/libs/jquery-2.2.4.js',
                'js/libs/jquery-ui.min.js',
                'js/libs/bootstrap-3.3.7.js',
                'js/libs/bootstrap-multiselect.js',
                'js/libs/DataTables/DataTables-1.10.16/js/jquery.dataTables.js',
                'js/libs/DataTables/DataTables-1.10.16/js/dataTables.bootstrap.js',
                'js/libs/moment.js',
                'js/libs/bootstrap-datetimepicker.js',
                'js/libs/leaflet/leaflet.js',
                'js/libs/leaflet/Leaflet.Editable.js',
                'js/libs/leaflet/leaflet-bing-layer.min.js',
                'js/build/WBLib.js',
                'js/wb.init.js'
            ),
            'output_filename': 'js/contrib.js'
        },
        'dashboards': {
            'source_filenames': (
                'js/libs/selectize/selectize.min.js',
                'js/libs/selectize/selectize-plugin-clear.js',
            ),
            'output_filename': 'js/dashboards.js'
        },
    },
    'STYLESHEETS': {
        'contrib': {
            'source_filenames': (
                'css/bootstrap-3.3.7.css',
                'css/jquery-ui.css',
                'css/bootstrap-datetimepicker.css',
                'css/font-awesome-4.7.0/css/font-awesome.min.css',
                'js/libs/leaflet/leaflet.css',
                'js/libs/DataTables/DataTables-1.10.16/css/dataTables.bootstrap.css',
                'js/build/css/wb-common.css',
            ),
            'output_filename': 'css/contrib.css',
            'extra_context': {
                'media': 'screen, projection',
            }
        },
        'dashboards': {
            'source_filenames': (
                'js/libs/selectize/selectize.bootstrap3.css',
                'js/libs/selectize/selectize-plugin-clear.css',
                'js/build/css/wb.dashboards.css',

            ),
            'output_filename': 'css/wb.dashboards.css'
        }
    }
}


# minio configuration

MINIO_STORAGE_ENDPOINT = os.environ.get('MINIO_STORAGE_ENDPOINT', 'localhost:9000')
MINIO_STORAGE_ACCESS_KEY = os.environ.get('MINIO_ACCESS_KEY', None)
MINIO_STORAGE_SECRET_KEY = os.environ.get('MINIO_SECRET_KEY', None)
MINIO_STORAGE_USE_HTTPS = False
MINIO_STORAGE_MEDIA_BUCKET_NAME = 'waterboard-media'
MINIO_STORAGE_AUTO_CREATE_MEDIA_BUCKET = True
MINIO_STORAGE_MEDIA_USE_PRESIGNED = True
# MINIO_STORAGE_STATIC_BUCKET_NAME = 'local-static'
# MINIO_STORAGE_AUTO_CREATE_STATIC_BUCKET = True
