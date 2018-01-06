# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime
from django.db import connection
from django.shortcuts import render

# Create your views here.
from django.utils import timezone
from django.views.generic import TemplateView

class FeatureByUUID(TemplateView):
    template_name = 'features/feature_by_uuid.html'

    def get_context_data(self, **kwargs):
        context = super(FeatureByUUID, self).get_context_data(**kwargs)

        end_date = timezone.now()
        start_date = end_date - datetime.timedelta(days=180)


        with connection.cursor() as cur:
            cur.execute(
                'SELECT * FROM core_utils.get_attribute_history_by_uuid(%s::uuid, %s, %s, %s)',
                (str(kwargs['feature_uuid']), 26, start_date, end_date)
            )
            context['feature_attribute_data'] = cur.fetchone()[0]

        return context
