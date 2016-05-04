__author__ = 'Irwan Fathurrahman <irwan@kartoza.com>'
__date__ = '04/05/16'
__license__ = "GPL"
__copyright__ = 'kartoza.com'

from celery import shared_task
from django.core.management import call_command


@shared_task
def regenerate_cache():
    call_command('gen_cluster_cache', 48, 46)
