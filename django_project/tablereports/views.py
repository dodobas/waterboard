# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.auth.decorators import login_required
from django.db import connection
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView


class TableReportView(TemplateView):
    template_name = 'tablereports/table-report.html'

    def get_context_data(self, **kwargs):

        context = super(TableReportView, self).get_context_data(**kwargs)

        with connection.cursor() as cur:
            cur.execute(
                'select data from core_utils.get_features(%s, -180, -90, 180, 90) as data;',
                (self.request.user.id, )
            )

            data = cur.fetchone()[0]

            cur.execute('select * from core_utils.get_attributes()')

            attributes = cur.fetchone()[0]

        context.update({'data': data, 'attributes': attributes})

        return context

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(TableReportView, self).dispatch(*args, **kwargs)
