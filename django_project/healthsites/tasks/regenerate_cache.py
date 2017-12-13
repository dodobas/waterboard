# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.core.management import call_command

from celery import shared_task


@shared_task
def regenerate_cache():
    call_command('gen_cluster_cache', 48, 46)
