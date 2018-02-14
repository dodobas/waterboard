# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import datetime
import json
from decimal import Decimal

from django.db import connection, transaction
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import timezone
from django.views.generic import FormView

from attributes.forms import AttributeForm, CreateFeatureForm
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


class FeatureCreate(LoginRequiredMixin, FormView):
    form_class = CreateFeatureForm
    template_name = 'features/create_feature.html'

    @staticmethod
    def serialize_attribute_data(v):
        if isinstance(v, Decimal):
            return float(v)
        else:
            return v

    def form_valid(self, form):
        attribute_data = {
            attribute: self.serialize_attribute_data(value)
            for subform in form.groups
            for attribute, value in subform.cleaned_data.items()
        }

        try:
            with transaction.atomic():
                # create CHANGESET
                with connection.cursor() as cursor:
                    cursor.execute(
                        'select * from core_utils.create_changeset(%s)',
                        (self.request.user.pk,)
                    )
                    changeset_id = cursor.fetchone()[0]

                    cursor.execute(
                        'select core_utils.create_feature(%s, ST_SetSRID(ST_Point(%s, %s), 4326), %s) ', (
                            changeset_id,

                            float(form.cleaned_data.get('_longitude')),
                            float(form.cleaned_data.get('_latitude')),

                            json.dumps(attribute_data)
                        )
                    )

                    updated_feature_uuid = cursor.fetchone()[0]
        except Exception:
            # TODO add some err response
            raise

        return HttpResponseRedirect('/feature-by-uuid/{}'.format(updated_feature_uuid))

    def form_invalid(self, form):
        response = self.render_to_response(self.get_context_data(form=form))

        response.status_code = 400

        return response


class FeatureForChangeset(LoginRequiredMixin, FormView):
    form_class = AttributeForm
    template_name = 'attributes/update_feature_form.html'

    def get_initial(self):
        initial = super(FeatureForChangeset, self).get_initial()

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
