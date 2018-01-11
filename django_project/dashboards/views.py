# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.db import connection
from django.views.generic import TemplateView


class DashboardView(TemplateView):
    template_name = 'dashboards/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super(DashboardView, self).get_context_data(**kwargs)

        with connection.cursor() as cur:
            cur.execute(
                'SELECT * FROM core_utils.get_dashboard_group_count(%s, %s, %s, %s)',
                (-180, -90, 180, 90)
            )
            context['group_cnt'] = cur.fetchone()[0]

            cur.execute(
                'SELECT * FROM core_utils.get_dashboard_fencing_count(%s, %s, %s, %s)',
                (-180, -90, 180, 90)
            )
            context['fencing_cnt'] = cur.fetchone()[0]

            cur.execute(
                'SELECT * FROM core_utils.get_dashboard_schemetype_count(%s, %s, %s, %s)',
                (-180, -90, 180, 90)
            )
            context['schemetype_cnt'] = cur.fetchone()[0]

            cur.execute(
                'SELECT * FROM core_utils.get_dashboard_functioning_count(%s, %s, %s, %s)',
                (-180, -90, 180, 90)
            )
            context['functioning_cnt'] = cur.fetchone()[0]

            cur.execute(
                'SELECT * FROM core_utils.get_dashboard_yieldgroup_count(%s, %s, %s, %s)',
                (-180, -90, 180, 90)
            )
            context['yield_cnt'] = cur.fetchone()[0]

        return context
