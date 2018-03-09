# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.db import connection
from django.http import HttpResponse
from django.views import View
from django.views.generic import TemplateView

from common.mixins import LoginRequiredMixin
from common.utils import grouper


class TableReportView(LoginRequiredMixin, TemplateView):
    template_name = 'tablereports/table-report.html'

    def get_context_data(self, **kwargs):

        context = super(TableReportView, self).get_context_data(**kwargs)

        with connection.cursor() as cur:
            cur.execute('select * from core_utils.get_attributes()')
            attributes = cur.fetchone()[0]

        context.update({'attributes': attributes})

        return context


class TableDataView(LoginRequiredMixin, View):

    def post(self, request, *args, **kwargs):

        def parse_column_data(index):
            key = 'columns[{}][data]'.format(index)
            return request.POST.get(key)

        # TODO: datatables uses draw count to distinguish between requests
        # draw = int(request.POST.get('draw', -1))

        limit = int(request.POST.get('length', 10))
        offset = int(request.POST.get('start', 0))

        search_value = request.POST.get('search[value]', '')

        if search_value:
            search_value = "WHERE name ILIKE '%{}%'".format(search_value)

        order_keys = sorted([key for key in request.POST.keys() if key.startswith('order[')])

        order_text = ', '.join(
            '{} {}'.format(parse_column_data(request.POST.get(col)), request.POST.get(dir))
            for col, dir in grouper(order_keys, 2)
            if request.POST.get(dir) in ('asc', 'desc')  # poor mans' security
        )

        if order_text:
            order_text = 'ORDER BY {}'.format(order_text)

        with connection.cursor() as cur:
            cur.execute(
                'select data from core_utils.get_features(%s, %s, %s, %s, %s) as data;',
                (self.request.user.id, limit, offset, order_text, search_value)
            )
            data = cur.fetchone()[0]

        return HttpResponse(content=data, content_type='application/json')


class CSVDownload(LoginRequiredMixin, View):

    def get(self, request, *args, **kwargs):

        with connection.cursor() as cur:
            cur.execute("""
                select * from  core_utils.export_all()
            """)

            query = cur.fetchone()[0]

            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="somefilename.csv"'

            cur.copy_expert(query, response)

            return response
