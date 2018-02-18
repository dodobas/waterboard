# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

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
                'SELECT * FROM core_utils.get_dashboard_chart_data(%s, %s, %s, %s, %s)',
                (self.request.user.id, -180, -90, 180, 90)
            )
            context['dashboard_chart_data'] = cur.fetchone()[0]

        return context


class DashboardsList(LoginRequiredMixin, View):

    def get(self, request):
        response = {}

        coord = [float(x) for x in request.GET.getlist('coord[]')]
        tabiya = request.GET.get('tabiya', None)
        fencing_exists = request.GET.get('tabiya', None)

        # filter sample, some keys might be ommited
        # {
        # "tabiya":"Egub",
        # "fencing_exists":"No",
        # "funded_by":"Food Security",
        # "water_committe_exist":"Unknown",
        # "static_water_level":4,
        # "amount_of_deposited":4,
        # "yield":5}
        with connection.cursor() as cur:

            cur.execute(
                'SELECT * FROM core_utils.get_dashboard_chart_data(%s, %s, %s, %s, %s, %s)',
                (self.request.user.id, coord[0], coord[1], coord[2], coord[3], tabiya)
            )
            response['dashboard_chart_data'] = cur.fetchone()[0]

        return JsonResponse(response, status=200)
