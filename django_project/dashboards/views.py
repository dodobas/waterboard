# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json

from django.db import connection
from django.http import HttpResponse, JsonResponse
from django.views import View
from django.views.generic import TemplateView

from common.mixins import LoginRequiredMixin
from common.utils import grouper


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'dashboards/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        with connection.cursor() as cur:
            cur.execute(
                'SELECT * FROM core_utils.filter_dashboard_chart_data(%s, %s, %s, %s, %s, %s)',
                (self.request.user.id, -180, -90, 180, 90, '{}')
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


class DashboardsTableReport(LoginRequiredMixin, View):

    # TODO this should be a GET request, but the param parsing was complex / hacky
    # maybe review at some point
    def post(self, request):
        def parse_column_data(index):
            key = 'columns[{}][data]'.format(index)
            return request.POST.get(key)

        _filters = json.loads(request.POST.get('_filters', '{}'))
        coord = _filters.get('coord', (-180, -90, 180, 90))
        query_filters = json.dumps(_filters.get('filters', {}))

        # TODO: datatables uses draw count to distinguish between requests
        # draw = int(request.POST.get('draw', -1))

        limit = int(request.POST.get('length', 10))
        offset = int(request.POST.get('start', 0))

        search_values = request.POST.get('search[value]', '').split(' ')
        if search_values:
            search_predicate = 'WHERE '

            search_predicates = (
                f"zone||' '||woreda||' '||tabiya||' '||kushet||' '||coalesce(name, '')||' '||unique_id ILIKE '%{search_value}%'"
                for search_value in search_values
            )

            search_predicate += ' AND '.join(search_predicates)
        else:
            search_predicate = None

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
                'select data '
                'from core_utils.filter_dashboard_table_data(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) as data;', (
                    self.request.user.id,
                    coord[0], coord[1], coord[2], coord[3], query_filters,
                    limit, offset, order_text, search_predicate
                )
            )
            data = cur.fetchone()[0]

        return HttpResponse(content=data, content_type='application/json')


class DashboardsMapData(LoginRequiredMixin, View):

    # TODO this should be a GET request, but the param parsing was complex / hacky
    # maybe review at some point
    def post(self, request):

        _filters = json.loads(request.POST.get('_filters', '{}'))
        coord = _filters.get('coord', (-180, -90, 180, 90))
        query_filters = json.dumps(_filters.get('filters', {}))

        zoom = int(request.POST.get('zoom', '0'))
        icon_size = 192

        with connection.cursor() as cur:
            cur.execute(
                'select data from core_utils.cluster_map_points(%s, %s, %s, %s, %s, %s, %s, %s) as data;',
                (self.request.user.id, coord[0], coord[1], coord[2], coord[3], query_filters, zoom, icon_size)
            )
            data = cur.fetchone()[0]

        return HttpResponse(content=data if data else '{}', content_type='application/json')
