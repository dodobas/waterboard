# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.db import connection
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView


SAMPLE_VIEW_DATA = """[
  {
    "name": "Agkali Eldery Care Homes",
    "geometry": [
      24.608388192111,
      35.21344935
    ],
    "country": "Greece",
    "overall_assessment": 5,
    "enriched": true,
    "created_date": "2017-12-10T19:44:50.840Z",
    "assessment": {},
    "id": 3,
    "data_captor": "knek@pecina.co"
  },
  {
    "name": "Abdulrahman Al Mshari Hospital",
    "geometry": [
      46.23046874999999,
      24.726874870506972
    ],
    "country": "Saudi Arabia",
    "overall_assessment": 5,
    "enriched": true,
    "created_date": "2017-12-10T19:45:38.808Z",
    "assessment": {},
    "id": 5,
    "data_captor": "knek@pecina.co"
  },
  {
    "name": "Adam's Hospital",
    "geometry": [
      31.1944807,
      30.0518353
    ],
    "country": "Egypt",
    "overall_assessment": 5,
    "enriched": true,
    "created_date": "2017-12-10T19:58:23.890Z",
    "assessment": {
      "kvaliteta/kvaliteta_1": {
        "option": "",
        "value": 5253,
        "description": ""
      },
      "kvaliteta/kvaliteta_2": {
        "option": "",
        "value": "25.01",
        "description": ""
      }
    },
    "id": 9,
    "data_captor": "knek@pecina.co"
  },
  {
    "name": "sadasdas",
    "geometry": [
      41.50000000000002,
      32.35253036241917
    ],
    "country": "Iraq",
    "overall_assessment": 2,
    "enriched": false,
    "created_date": "2017-12-13T21:36:12.192Z",
    "assessment": {},
    "id": 13,
    "data_captor": "knek@pecina.co"
  }
]"""


class TableReportView(TemplateView):
    template_name = 'healthsites-reports.html'

    def get_context_data(self, **kwargs):

        context = super(TableReportView, self).get_context_data(**kwargs)

        with connection.cursor() as cur:
            cur.execute('select data from {schema_name}.get_events(-180, -90, 180, 90) as data;'.format(
                schema_name=settings.PG_UTILS_SCHEMA))

            data = cur.fetchone()[0]

        context.update({
             'data': data
        })

        return context

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(TableReportView, self).dispatch(*args, **kwargs)
