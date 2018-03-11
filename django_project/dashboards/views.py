# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json

from django.db import connection
from django.http import JsonResponse
from django.views import View
from django.views.generic import TemplateView

from common.mixins import LoginRequiredMixin


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'dashboards/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super(DashboardView, self).get_context_data(**kwargs)

        with connection.cursor() as cur:
            cur.execute(
                'SELECT * FROM core_utils.filter_dashboard_chart_data(%s, %s, %s, %s, %s)',
                (self.request.user.id, -180, -90, 180, 90)
            )
            context['dashboard_chart_data'] = cur.fetchone()[0]

        return context


class DashboardsList(LoginRequiredMixin, View):

    # TODO this should be a GET request, but the param parsing was complex / hacky
    # maybe review at some point
    def post(self, request):
        response = {}

        filters = json.loads(request.body.decode('utf-8'))

        coord = filters.get('coord', None)

        query_filters = json.dumps(filters.get('filters', '{}'))

        with connection.cursor() as cur:

            cur.execute(
                'SELECT * FROM core_utils.filter_dashboard_chart_data(%s, %s, %s, %s, %s, %s)',
                (self.request.user.id, coord[0], coord[1], coord[2], coord[3], query_filters)
            )
            response['dashboard_chart_data'] = cur.fetchone()[0]

        return JsonResponse(response, status=200)
