# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.auth.decorators import login_required
from django.db import connection
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView

import time
import json


class TableReportView(TemplateView):
    template_name = 'tablereports/table-report.html'

    def get_context_data(self, **kwargs):

        context = super(TableReportView, self).get_context_data(**kwargs)

        with connection.cursor() as cur:
            start_time = time.time()
            cur.execute(
                'select data from core_utils.get_features(%s, -180, -90, 180, 90) as data;',
                (self.request.user.id, )
            )

            data = cur.fetchone()[0]
            print('get features', time.time() - start_time)

            start_time = time.time()
            cur.execute('select * from core_utils.get_attributes()')

            attributes = json.loads(cur.fetchone()[0])
            print('get attributes', time.time() - start_time)

        context.update({'data': data, 'attributes': json.dumps(attributes)})

        return context

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(TableReportView, self).dispatch(*args, **kwargs)
