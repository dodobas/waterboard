# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json

from django.contrib.auth.decorators import login_required
from django.db import connection
from django.http import HttpResponse
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
        # create CHANGESET
        with connection.cursor() as cursor:
            cursor.execute(
                'select * from core_utils.create_changeset(%s)',
                (self.request.user.pk,)
            )
            changeset_id = cursor.fetchone()[0]

            cursor.execute(
                'select core_utils.add_feature(%s, %s, %s, ST_SetSRID(ST_Point(%s, %s), 4326), %s, %s) ', (
                    form.cleaned_data.get('feature_uuid'),
                    changeset_id,
                    form.cleaned_data.get('name'),

                    float(form.cleaned_data.get('latitude')),
                    float(form.cleaned_data.get('longitude')),

                    form.cleaned_data.get('overall_assessment'),
                    '{}'
                )
            )

            updated_feature_json = cursor.fetchone()[0]

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

        initial['feature_uuid'] = feature['id']
        initial['longitude'] = feature['geometry'][0]
        initial['latitude'] = feature['geometry'][1]
        initial['latest_update'] = feature['created_date']
        initial['name'] = feature['name']
        initial['overall_assessment'] = feature['overall_assessment']
        initial['latest_data_captor'] = feature['data_captor']

        return initial
