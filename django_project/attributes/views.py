# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json
from decimal import Decimal

from django.contrib.auth.decorators import login_required
from django.db import connection, transaction
from django.http import HttpResponse, HttpResponseServerError
from django.utils.decorators import method_decorator
from django.views.generic import FormView

from .forms import AttributeForm


class AttributesView(FormView):
    template_name = 'healthsites.html'
    form_class = AttributeForm
    success_url = '/healthsites'
    success_message = 'new event was added successfully'

    def form_valid(self, form):
        form.save_form()
        return super(AttributesView, self).form_valid(form)

    def get_form_kwargs(self):
        kwargs = super(AttributesView, self).get_form_kwargs()
        return kwargs

    def get_success_message(self, cleaned_data):
        return self.success_message

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(AttributesView, self).dispatch(*args, **kwargs)


class UpdateFeature(FormView):
    form_class = AttributeForm
    template_name = 'attributes/update_feature_form.html'

    def form_valid(self, form):
        # TODO handle null attribute values (maybe better in the add_event fnc) - currently the add event will fail
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
                        'select core_utils.add_feature(%s, %s, ST_SetSRID(ST_Point(%s, %s), 4326), %s) ', (
                            form.cleaned_data.get('_feature_uuid'),
                            changeset_id,

                            float(form.cleaned_data.get('_latitude')),
                            float(form.cleaned_data.get('_longitude')),

                            json.dumps(attribute_data)
                        )
                    )

                    updated_feature_json = cursor.fetchone()[0]
        except Exception as e:
            # TODO add some err response
            raise
            # return HttpResponseServerError()

        return HttpResponse(updated_feature_json, content_type='application/json')

    def form_invalid(self, form):
        response = self.render_to_response(self.get_context_data(form=form))

        response.status_code = 400

        return response

    def get_initial(self):
        initial = super(UpdateFeature, self).get_initial()

        with connection.cursor() as cursor:
            cursor.execute(
                'select * from core_utils.get_event_by_uuid(%s)',
                (self.kwargs.get('pk'), )
            )
            feature = json.loads(cursor.fetchone()[0])[0]

        initial['_feature_uuid'] = feature['_feature_uuid']
        initial['_latitude'] = feature['_geometry'][0]
        initial['_longitude'] = feature['_geometry'][1]


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
