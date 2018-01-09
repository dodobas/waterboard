# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime
import json
from decimal import Decimal

from django.db import connection
from django.http import HttpResponse

from attributes.forms import AttributeForm
# Create your views here.
from django.utils import timezone
from django.views.generic import TemplateView, FormView

class FeatureByUUID(FormView):
    form_class = AttributeForm
    template_name = 'features/feature_by_uuid.html'


    def form_valid(self, form):
        attribute_data = {
            attribute: self.serialize_attribute_data(value)
            for subform in form.groups
            for attribute, value in subform.cleaned_data.items()
        }

        # create CHANGESET
        with connection.cursor() as cursor:
            cursor.execute(
                'select * from core_utils.create_changeset(%s)',
                (self.request.user.pk,)
            )
            changeset_id = cursor.fetchone()[0]

            cursor.execute(
                'select core_utils.add_feature(%s, %s, ST_SetSRID(ST_Point(%s, %s), 4326), %s) ', (
                    form.cleaned_data.get('_feature_uuid'),
                    changeset_id,

                    float(form.cleaned_data.get('_latitude')),
                    float(form.cleaned_data.get('_longitude')),

                    json.dumps(attribute_data)
                )
            )

            updated_feature_json = cursor.fetchone()[0]

        return HttpResponse(updated_feature_json, content_type='application/json')

    def form_invalid(self, form):
        response = self.render_to_response(self.get_context_data(form=form))

        response.status_code = 400

        return response

    def get_initial(self):
        initial = super(FeatureByUUID, self).get_initial()

        with connection.cursor() as cursor:
            cursor.execute(
                'select * from core_utils.get_event_by_uuid(%s)',
                (str(self.kwargs.get('feature_uuid')), )
            )
            feature = json.loads(cursor.fetchone()[0])[0]

        initial['_feature_uuid'] = feature['_feature_uuid']
        initial['_longitude'] = feature['_geometry'][0]
        initial['_latitude'] = feature['_geometry'][1]

        # add attribute data to initial form data
        attribute_keys = [compound_key for compound_key in feature.keys() if not(compound_key.startswith('_'))]

        for compound_key in attribute_keys:
            attribute_key = compound_key.split('/')[-1]
            initial[attribute_key] = feature[compound_key]

        return initial

    @staticmethod
    def serialize_attribute_data(v):
        if isinstance(v, Decimal):
            return float(v)
        else:
            return v

    def get_context_data(self, **kwargs):
        context = super(FeatureByUUID, self).get_context_data(**kwargs)

        end_date = timezone.now()
        start_date = end_date - datetime.timedelta(days=180)


        with connection.cursor() as cur:
            cur.execute(
                'SELECT * FROM core_utils.get_attribute_history_by_uuid(%s::uuid, %s, %s, %s)',
                (str(self.kwargs.get('feature_uuid')), 26, start_date, end_date)
            )
            context['feature_attribute_data'] = cur.fetchone()[0]

        return context
