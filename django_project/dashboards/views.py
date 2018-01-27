# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.auth.decorators import login_required
from django.db import connection
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.generic import TemplateView


class DashboardView(TemplateView):
    template_name = 'dashboards/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super(DashboardView, self).get_context_data(**kwargs)

        # chart_data = {}

        with connection.cursor() as cur:

            cur.execute(
                'SELECT * FROM core_utils.get_fencing_dashboard_chart_data(%s, %s, %s, %s, %s)',
                (self.request.user.id, -180, -90, 180, 90)
            )

            fencing_chart = cur.fetchone()

            context['fencing_chart'] = fencing_chart[0] if fencing_chart[0] else '{}'

            cur.execute(
                'SELECT * FROM core_utils.get_beneficiaries_dashboard_chart_data(%s, %s, %s, %s, %s)',
                (self.request.user.id, -180, -90, 180, 90)
            )

            beneficiaries_chart = cur.fetchone()

            context['beneficiaries_chart'] = beneficiaries_chart[0] if beneficiaries_chart[0] else '{}'
 #           context['chart_data'] = chart_data

            cur.execute(
                'SELECT * FROM core_utils.get_dashboard_group_count(%s, %s, %s, %s, %s)',
                (self.request.user.id, -180, -90, 180, 90)
            )
            context['group_cnt'] = cur.fetchone()[0]

            cur.execute(
                'SELECT * FROM core_utils.get_dashboard_fencing_count(%s, %s, %s, %s, %s)',
                (self.request.user.id, -180, -90, 180, 90)
            )
            context['fencing_cnt'] = cur.fetchone()[0]

            cur.execute(
                'SELECT * FROM core_utils.get_dashboard_schemetype_count(%s, %s, %s, %s, %s)',
                (self.request.user.id, -180, -90, 180, 90)
            )
            context['schemetype_cnt'] = cur.fetchone()[0]

            cur.execute(
                'SELECT * FROM core_utils.get_dashboard_functioning_count(%s, %s, %s, %s, %s)',
                (self.request.user.id, -180, -90, 180, 90)
            )
            context['functioning_cnt'] = cur.fetchone()[0]

            cur.execute(
                'SELECT * FROM core_utils.get_dashboard_yieldgroup_count(%s, %s, %s, %s, %s)',
                (self.request.user.id, -180, -90, 180, 90)
            )
            context['yield_cnt'] = cur.fetchone()[0]

            cur.execute(
                """select jsonb_agg(row)::text FROM (
select feature_uuid, ST_X(point_geometry) as lng, ST_Y(point_geometry) as lat
from features.feature where is_active = True) row""",
                ()
            )

            context['map_features'] = cur.fetchone()[0]

        return context

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(DashboardView, self).dispatch(*args, **kwargs)


class DashboardsList(View):

    def get(self, request):
        context = {}

        coord = [float(x) for x in request.GET.getlist('coord[]')]
        tabiya = request.GET.get('tabiya', None)
        print(coord)
        with connection.cursor() as cur:

            cur.execute(
                'SELECT * FROM core_utils.get_dashboard_group_count(%s, %s, %s, %s, %s)',
                (self.request.user.id, coord[0], coord[1], coord[2], coord[3])
            )
            context['group_cnt'] = cur.fetchone()[0]


            if tabiya is not None:
                cur.execute(
                    """
select jsonb_agg(row)::text FROM (
                    	select
			ff.feature_uuid,
		ST_X(point_geometry) as lng,
		ST_Y(point_geometry) as lat
	from
			features.feature ff
	join (
		select
				feature_uuid from
			core_utils.q_feature_attributes(%s, %s, %s, %s, %s, 'tabiya') AS (feature_uuid UUID, tabiya VARCHAR)
				WHERE tabiya = %s

		) d
	on
			ff.feature_uuid = d.feature_uuid
 where
	 is_active = True) row
                    """,
                    (self.request.user.id, coord[0], coord[1], coord[2], coord[3], tabiya)
                )
            else:
                cur.execute(
                    """select jsonb_agg(row)::text FROM (
    select feature_uuid, ST_X(point_geometry) as lng, ST_Y(point_geometry) as lat
    from features.feature where is_active = True) row""",
                    ()
                )

            context['map_features'] = cur.fetchone()[0]


        return JsonResponse(
            context, status=200
        )

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(DashboardsList, self).dispatch(*args, **kwargs)
