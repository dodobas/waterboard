# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json
from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from django.views.generic import TemplateView, View


# @login_required
# def healthsites_reports(request):
#     return render(
#         request,
#         'healthsites-reports.html',
#         {
#             'sample': ''
#         }
#     )


class TableReportView(TemplateView):
    template_name = 'healthsites-reports.html'

    def get_context_data(self, **kwargs):

        context = super(TableReportView, self).get_context_data(**kwargs)

        context.update({
             'data': json.dumps({})
        })

        return context
