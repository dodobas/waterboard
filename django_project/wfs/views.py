# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.db import connection
from django.http import HttpResponse
from django.shortcuts import render
from django.views import View

from .utils import parse_attributes


class GetCapabilities(View):
    def get(self, request):
        url_params = {}

        # https://github.com/vascop/django-wfs/blob/master/wfs/views.py
        for key, value in request.GET.items():
            url_params[key.lower()] = value

        if url_params.get('request') == 'GetCapabilities':
            return render(request, 'wfs/get_capabilities.xml', content_type='text/xml')

        elif url_params.get('request') == 'DescribeFeatureType':
            with connection.cursor() as cursor:
                cursor.execute("""
                SELECT aa.key, aa.result_type, aa.label
                FROM attributes_attribute aa INNER JOIN attributes_attributegroup ag ON aa.attribute_group_id = ag.id
                WHERE aa.is_active = TRUE
                ORDER BY ag.position, aa.position;
                """)

                attributes = cursor.fetchall()

                cursor.execute('SELECT * FROM features.active_data LIMIT 1;')

                header = []
                for attribute_key in cursor.description:
                    header.append(attribute_key[0])

            attributes = parse_attributes(attributes, header)

            return render(
                request, 'wfs/describe_feature_type.xml', {'attributes': attributes}, content_type='text/xml'
            )

        elif url_params.get('request') == 'GetFeature':
            try:
                bbox = url_params.get('bbox').split(',')
                y_min = bbox[0]
                x_min = bbox[1]
                y_max = bbox[2]
                x_max = bbox[3]

                # TODO check srid, 4326?
                srid = bbox[4].split(':')[-1]

            except (IndexError, AttributeError):
                y_min = -90
                x_min = -180
                y_max = 90
                x_max = 180
                srid = 4326

            with connection.cursor() as cursor:
                cursor.execute(
                    'SELECT core_utils.wfs_get_feature_xml(%s, %s, %s, %s, %s);', (x_min, y_min, x_max, y_max, srid)
                )

                response = cursor.fetchall()[0]

            return HttpResponse(response, content_type='application/gml+xml')
