# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

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
