# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.shortcuts import render
from django.views import View

from .utils import get_attributes, get_data

attributes = get_attributes()


class GetCapabilities(View):
    def get(self, request):

        # https://github.com/vascop/django-wfs/blob/master/wfs/views.py
        for key, value in request.GET.items():
            low_key = key.lower()

            if low_key == 'request':
                if value == 'GetCapabilities':
                    return render(request, 'wfs/get_capabilities.xml', content_type='text/xml')

                elif value == 'DescribeFeatureType':
                    return render(
                        request, 'wfs/describe_feature_type.xml', {'attributes': attributes}, content_type='text/xml'
                    )

                elif value == 'GetFeature':
                    data = get_data()
                    return render(request, 'wfs/get_feature.xml', {'data': data}, content_type='application/gml+xml')
