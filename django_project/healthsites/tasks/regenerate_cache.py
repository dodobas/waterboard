# -*- coding: utf-8 -*-
from __future__ import unicode_literals, print_function, absolute_import, division

from celery import shared_task
from django.core.management import call_command


@shared_task
def regenerate_cache():
    call_command('gen_cluster_cache', 48, 46)
