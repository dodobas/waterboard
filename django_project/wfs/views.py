# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import datetime

from django.db import connection
from django.shortcuts import render
from django.views import View

from .utils import parse_attributes, parse_data


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
                SELECT attributes_attribute.key, attributes_attribute.result_type
                FROM public.attributes_attribute
                WHERE attributes_attribute.is_active = TRUE;
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

                # TODO check srid
                srid = bbox[4].split(':')[-1]
                bbox = {'x_min': x_min, 'y_min': y_min, 'x_max': x_max, 'y_max': y_max}

                with connection.cursor() as cursor:
                    cursor.execute("""
                    SELECT *
                    FROM features.active_data
                    WHERE ST_Within(point_geometry, ST_MakeEnvelope(%s,%s,%s,%s,%s));
                    """, (bbox['x_min'], bbox['y_min'], bbox['x_max'], bbox['y_max'], srid))

                    data = parse_data(cursor.description, cursor.fetchall())

            except (IndexError, AttributeError):

                with connection.cursor() as cursor:
                    cursor.execute('SELECT * FROM features.active_data;')

                    data = parse_data(cursor.description, cursor.fetchall())
                    bbox = None

            print(bbox)
            return render(
                request, 'wfs/get_feature.xml',
                {'data': data, 'timestamp': datetime.datetime.utcnow().isoformat('T') + '+00:00', 'bbox': bbox},
                content_type='application/gml+xml'
            )
