# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.db import connection
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView


class TableReportView(TemplateView):
    template_name = 'healthsites-reports.html'

    def get_context_data(self, **kwargs):

        context = super(TableReportView, self).get_context_data(**kwargs)

        with connection.cursor() as cur:
            cur.execute('select data from {schema_name}.get_events(-180, -90, 180, 90) as data;'.format(
                schema_name=settings.PG_UTILS_SCHEMA))

            data = cur.fetchone()[0]

        context.update({'data': data})

        return context

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(TableReportView, self).dispatch(*args, **kwargs)
