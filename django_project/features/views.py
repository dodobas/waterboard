# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import datetime
import json
from decimal import Decimal

from django.db import connection, transaction
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.utils import timezone
from django.views import View
from django.views.generic import FormView

from attributes.forms import CreateFeatureForm, UpdateFeatureForm
from common.mixins import LoginRequiredMixin

import logging

LOG = logging.getLogger(__name__)


class FeatureByUUID(LoginRequiredMixin, FormView):
    form_class = UpdateFeatureForm
    template_name = 'features/feature_by_uuid.html'

    def form_valid(self, form):
        raise NotImplemented

    def form_invalid(self, form):
        raise NotImplemented

    def get_initial(self):
        initial = super().get_initial()

        with connection.cursor() as cursor:
            cursor.execute(
                'select * from core_utils.get_feature_by_uuid_for_changeset(%s)',
                (str(self.kwargs.get('feature_uuid')), )
            )
            result = json.loads(cursor.fetchone()[0])

        if len(result) == 0:
            raise Http404

        self.feature = result[0]

        initial['_feature_uuid'] = self.feature['_feature_uuid']

        # TODO: clean this, only add attributes to the initial fields
        # add attribute data to initial form data
        attribute_keys = [compound_key for compound_key in self.feature.keys() if not(compound_key.startswith('_'))]

        for attribute_key in attribute_keys:
            initial[attribute_key] = self.feature[attribute_key]

        return initial

    @staticmethod
    def serialize_attribute_data(v):
        if isinstance(v, Decimal):
            return float(v)
        else:
            return v

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()

        kwargs['webuser'] = self.request.user

        return kwargs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context['featureData'] = json.dumps(self.feature)
        context['feature_uuid'] = self.kwargs.get('feature_uuid')

        end_date = timezone.now()
        start_date = end_date - datetime.timedelta(weeks=104)

        with connection.cursor() as cur:
            cur.execute(
                'SELECT * FROM core_utils.get_feature_history_by_uuid(%s::uuid, %s, %s)',
                (str(self.kwargs.get('feature_uuid')), start_date, end_date)
            )
            result = cur.fetchone()[0]
            context['feature_history'] = result if result else '[]'

            # TODO: select attribute by key and not by ID
            cur.execute(
                'SELECT * FROM core_utils.get_attribute_history_by_uuid(%s::uuid, %s, %s, %s)',
                (str(self.kwargs.get('feature_uuid')), 'yield', start_date, end_date)
            )
            result = cur.fetchone()[0]
            context['feature_attribute_data_yield'] = result if result else '[]'

            # TODO: select attribute by key and not by ID
            cur.execute(
                'SELECT * FROM core_utils.get_attribute_history_by_uuid(%s::uuid, %s, %s, %s)',
                (str(self.kwargs.get('feature_uuid')), 'static_water_level', start_date, end_date)
            )
            result = cur.fetchone()[0]
            context['feature_attribute_data_static'] = result if result else '[]'

        return context


class FeatureCreate(LoginRequiredMixin, FormView):
    form_class = CreateFeatureForm
    template_name = 'features/create_feature.html'

    def post(self, request, *args, **kwargs):
        webuser = self.request.user

        form = self.get_form()

        if webuser.is_readonly:
            form.add_error(None, 'No privileges to create the water point')

            return self.form_invalid(form)
        else:
            if form.is_valid():
                return self.form_valid(form)
            else:
                return self.form_invalid(form)

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()

        kwargs['webuser'] = self.request.user

        return kwargs

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
                with connection.cursor() as cursor:
                    cursor.execute(
                        'INSERT INTO features.changeset (webuser_id, changeset_type) VALUES (%s, %s) RETURNING id', (
                            self.request.user.pk, 'U'
                        )
                    )
                    changeset_id = cursor.fetchone()[0]

                    cursor.execute(
                        'select core_utils.create_feature(%s, %s) ', (changeset_id, json.dumps(attribute_data))
                    )

                    created_feature_uuid = cursor.fetchone()[0]
        except Exception:
            # TODO add some err response
            raise

        return HttpResponseRedirect('/feature-by-uuid/{}'.format(created_feature_uuid))

    def form_invalid(self, form):
        response = self.render_to_response(self.get_context_data(form=form))

        response.status_code = 400

        return response


class UpdateFeature(LoginRequiredMixin, FormView):
    form_class = UpdateFeatureForm
    template_name = 'attributes/update_feature_form.html'

    def post(self, request, *args, **kwargs):
        webuser = self.request.user

        form = self.get_form()

        if webuser.is_readonly:
            form.add_error(None, 'No privileges to update the water point')

            return self.form_invalid(form)
        else:
            if form.is_valid():
                return self.form_valid(form)
            else:
                return self.form_invalid(form)

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()

        kwargs['webuser'] = self.request.user

        return kwargs

    def form_valid(self, form):
        attribute_data = {
            attribute: self.serialize_attribute_data(value)
            for subform in form.groups
            for attribute, value in subform.cleaned_data.items()
        }

        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute(
                        'INSERT INTO features.changeset (webuser_id, changeset_type) VALUES (%s, %s) RETURNING id', (
                            self.request.user.pk, 'U'
                        )
                    )
                    changeset_id = cursor.fetchone()[0]

                    # update_feature fnc updates also public.active_data
                    cursor.execute(
                        'select core_utils.update_feature(%s, %s, %s) ', (
                            changeset_id,
                            form.cleaned_data.get('_feature_uuid'),
                            json.dumps(attribute_data)
                        )
                    )

                    updated_feature_json = cursor.fetchone()[0]
        except Exception:
            # TODO add some err response
            raise
            # return HttpResponseServerError()
        # TODO: this is not needed, on the frontend we are not processing JSON, since we simply refresh the page
        return HttpResponse(updated_feature_json, content_type='application/json')

    def form_invalid(self, form):
        response = self.render_to_response(self.get_context_data(form=form))

        response.status_code = 400

        return response

    def get_initial(self):
        initial = super().get_initial()

        with connection.cursor() as cursor:
            cursor.execute(
                'select * from core_utils.get_feature_by_uuid_for_changeset(%s)',
                (self.kwargs.get('pk'), )
            )
            feature = json.loads(cursor.fetchone()[0])[0]

        initial['_feature_uuid'] = feature['_feature_uuid']

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


class DeleteFeature(View):
    def delete(self, request, feature_uuid):
        with connection.cursor() as cursor:
            cursor.execute('select * from core_utils.delete_feature(%s)', (feature_uuid, ))

            has_errors = cursor.fetchone()[0]

        if has_errors:
            return HttpResponse(content=has_errors, status=400)
        else:
            return HttpResponse(content=feature_uuid, status=204)


class FeatureForChangeset(LoginRequiredMixin, FormView):
    form_class = UpdateFeatureForm
    template_name = 'attributes/update_feature_form.html'

    def get_initial(self):
        initial = super().get_initial()

        with connection.cursor() as cursor:
            cursor.execute(
                'select * from core_utils.get_feature_by_uuid_for_changeset(%s, %s)',
                (str(self.kwargs.get('feature_uuid')), int(self.kwargs.get('changeset_id')))
            )

            data = cursor.fetchone()
            self.feature = json.loads(data[0])[0]

        initial['_feature_uuid'] = self.feature['_feature_uuid']
        initial['_longitude'] = self.feature['_geometry'][0]
        initial['_latitude'] = self.feature['_geometry'][1]

        # add attribute data to initial form data
        attribute_keys = [compound_key for compound_key in self.feature.keys() if not(compound_key.startswith('_'))]

        for attribute_key in attribute_keys:
            initial[attribute_key] = self.feature[attribute_key]

        return initial

    @staticmethod
    def serialize_attribute_data(v):
        if isinstance(v, Decimal):
            return float(v)
        else:
            return v

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()

        kwargs['webuser'] = self.request.user

        return kwargs
