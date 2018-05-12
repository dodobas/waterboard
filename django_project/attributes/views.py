# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json
from decimal import Decimal

from django.db import connection, transaction
from django.http import HttpResponse
from django.views.generic import FormView

from common.mixins import LoginRequiredMixin

from .forms import AttributeForm


class UpdateFeature(LoginRequiredMixin, FormView):
    form_class = AttributeForm
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
        kwargs = super(UpdateFeature, self).get_form_kwargs()

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
                # create CHANGESET
                with connection.cursor() as cursor:
                    cursor.execute(
                        'select * from core_utils.create_changeset(%s)',
                        (self.request.user.pk,)
                    )
                    changeset_id = cursor.fetchone()[0]

                    # add_features fnc updates also public.active_data
                    cursor.execute(
                        'select core_utils.add_feature(%s, %s, ST_SetSRID(ST_Point(%s, %s), 4326), %s) ', (
                            form.cleaned_data.get('_feature_uuid'),
                            changeset_id,

                            float(form.cleaned_data.get('_longitude')),
                            float(form.cleaned_data.get('_latitude')),

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
        initial = super(UpdateFeature, self).get_initial()

        with connection.cursor() as cursor:
            cursor.execute(
                'select * from core_utils.get_event(%s)',
                (self.kwargs.get('pk'), )
            )
            feature = json.loads(cursor.fetchone()[0])[0]

        initial['_feature_uuid'] = feature['_feature_uuid']
        initial['_latitude'] = feature['_geometry'][1]
        initial['_longitude'] = feature['_geometry'][0]

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
