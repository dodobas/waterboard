# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime

from django.db import connection
from django.shortcuts import render
from django.utils import timezone
from django.views.generic import TemplateView


class DashboardView(TemplateView):
    template_name = 'dashboards/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super(DashboardView, self).get_context_data(**kwargs)

        end_date = timezone.now()
        start_date = end_date - datetime.timedelta(days=180)


        with connection.cursor() as cur:
            cur.execute(
                'SELECT * FROM core_utils.get_dashboard_group_count(%s, %s, %s, %s)',
                (-180, -90, 180, 90)
            )
            context['group_cnt'] = cur.fetchone()[0]

        return context

