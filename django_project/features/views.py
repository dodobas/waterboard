# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import datetime
import json
from decimal import Decimal

from django.db import connection
from django.utils import timezone
from django.views.generic import FormView

from attributes.forms import AttributeForm
from common.mixins import LoginRequiredMixin


class FeatureByUUID(LoginRequiredMixin, FormView):
    form_class = AttributeForm
    template_name = 'features/feature_by_uuid.html'

    def form_valid(self, form):
        raise NotImplemented

    def form_invalid(self, form):
        raise NotImplemented

    def get_initial(self):
        initial = super(FeatureByUUID, self).get_initial()

        with connection.cursor() as cursor:
            cursor.execute(
                'select * from core_utils.get_event_by_uuid(%s)',
                (str(self.kwargs.get('feature_uuid')), )
            )
            self.feature = json.loads(cursor.fetchone()[0])[0]

        initial['_feature_uuid'] = self.feature['_feature_uuid']
        initial['_longitude'] = self.feature['_geometry'][0]
        initial['_latitude'] = self.feature['_geometry'][1]

        # add attribute data to initial form data
        attribute_keys = [compound_key for compound_key in self.feature.keys() if not(compound_key.startswith('_'))]

        for compound_key in attribute_keys:
            attribute_key = compound_key.split('/')[-1]
            initial[attribute_key] = self.feature[compound_key]

        return initial

    @staticmethod
    def serialize_attribute_data(v):
        if isinstance(v, Decimal):
            return float(v)
        else:
            return v

    def get_context_data(self, **kwargs):
        context = super(FeatureByUUID, self).get_context_data(**kwargs)

        context['featureData'] = json.dumps(self.feature)

        end_date = timezone.now()
        start_date = end_date - datetime.timedelta(weeks=104)

        with connection.cursor() as cur:
            cur.execute(
                'SELECT * FROM core_utils.get_feature_history_by_uuid(%s::uuid, %s, %s)',
                (str(self.kwargs.get('feature_uuid')), start_date, end_date)
            )
            result = cur.fetchone()[0]
            context['feature_history'] = result if result else '[]'

            cur.execute(
                'SELECT * FROM core_utils.get_attribute_history_by_uuid(%s::uuid, %s, %s, %s)',
                (str(self.kwargs.get('feature_uuid')), 26, start_date, end_date)
            )
            result = cur.fetchone()[0]
            context['feature_attribute_data_yield'] = result if result else '[]'

            cur.execute(
                'SELECT * FROM core_utils.get_attribute_history_by_uuid(%s::uuid, %s, %s, %s)',
                (str(self.kwargs.get('feature_uuid')), 22, start_date, end_date)
            )
            result = cur.fetchone()[0]
            context['feature_attribute_data_static'] = result if result else '[]'

        return context


class FeatureForChangest(LoginRequiredMixin, FormView):
    form_class = AttributeForm
    template_name = 'attributes/update_feature_form.html'

    def get_initial(self):
        initial = super(FeatureForChangest, self).get_initial()

        with connection.cursor() as cursor:
            cursor.execute(
                'select * from core_utils.get_feature_by_changeset_uuid(%s, %s)',
                (str(self.kwargs.get('feature_uuid')), str(self.kwargs.get('changeset_id')))
            )
            self.feature = json.loads(cursor.fetchone()[0])[0]

        initial['_feature_uuid'] = self.feature['_feature_uuid']
        initial['_longitude'] = self.feature['_geometry'][0]
        initial['_latitude'] = self.feature['_geometry'][1]

        # add attribute data to initial form data
        attribute_keys = [compound_key for compound_key in self.feature.keys() if not(compound_key.startswith('_'))]

        for compound_key in attribute_keys:
            attribute_key = compound_key.split('/')[-1]
            initial[attribute_key] = self.feature[compound_key]

        return initial

    @staticmethod
    def serialize_attribute_data(v):
        if isinstance(v, Decimal):
            return float(v)
        else:
            return v
