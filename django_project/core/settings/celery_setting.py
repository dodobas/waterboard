# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'celery'
__date__ = '7/28/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

from celery.schedules import crontab

CELERYBEAT_SCHEDULE = {
    'daily-report': {
        'task': 'tasks.daily_report',
        'schedule': crontab(hour=18, minute=0),
    },
    'daily-assessment-report': {
        'task': 'tasks.daily_assessment_report',
        'schedule': crontab(hour=0, minute=0),
    },
}

CELERY_TIMEZONE = 'UTC'
