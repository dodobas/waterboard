# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.db import connection
from django.http import HttpResponse
from django.views import View
from django.views.generic import TemplateView

from common.mixins import LoginRequiredMixin


class TableReportView(LoginRequiredMixin, TemplateView):
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
