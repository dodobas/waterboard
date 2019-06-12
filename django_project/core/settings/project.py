from .contrib import *  # noqa

# Project apps
INSTALLED_APPS += (
    'attachments',
    'attributes',
    'webusers',
    'features',
    'dashboards',
    'tablereports',
    'exports',
    'apis',
    'imports',
    'changesets',
    'feature_diff',
)

DEBUG = True

# reports directory
# REPORTS_DIRECTORY = os.path.join(MEDIA_ROOT, 'reports')


AUTH_USER_MODEL = 'webusers.WebUser'

LOGIN_URL = '/login'

START_PAGE_URL = 'dashboards:index'

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'webusers.backends.CaseInsensitiveLoginModelBackend',
    'webusers.backends.EmailLoginModelBackend'
)
