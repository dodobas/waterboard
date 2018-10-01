# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.db import connection
from django.http import HttpResponse
from django.views import View


class WfsOperations(View):
    def get(self, request):
        url_params = {}

        # https://github.com/vascop/django-wfs/blob/master/wfs/views.py
        for key, value in request.GET.items():
            url_params[key.lower()] = value

        host = request.build_absolute_uri('')

        try:
            version = url_params['version']
        except KeyError:
            version = '2.0.2'

        if version not in ['1.0.0', '1.1.0', '2.0.0', '2.0.2']:
            pass
            #TODO exception

        if url_params.get('request') == 'GetCapabilities':
            # https://fragmentsofcode.wordpress.com/2009/02/24/django-fully-qualified-url/
            with connection.cursor() as cursor:
                cursor.execute('SELECT core_utils.wfs_get_capabilities_xml(%s, %s);', (host, version, ))

                response = cursor.fetchall()[0]

            return HttpResponse(response, content_type='text/xml')

        elif url_params.get('request') == 'DescribeFeatureType':
            with connection.cursor() as cursor:
                cursor.execute('SELECT core_utils.wfs_describe_feature_type_xml(%s);', (host, ))

                response = cursor.fetchall()[0]

            return HttpResponse(response, content_type='text/xml')

        elif url_params.get('request') == 'GetFeature':
            try:
                bbox = url_params.get('bbox').split(',')
                y_min = bbox[0]
                x_min = bbox[1]
                y_max = bbox[2]
                x_max = bbox[3]

                srid = bbox[4].split(':')[-1]

            except (IndexError, AttributeError):
                y_min = -90
                x_min = -180
                y_max = 90
                x_max = 180
                srid = 4326

            with connection.cursor() as cursor:
                cursor.execute(
                    'SELECT core_utils.wfs_get_feature_xml(%s, %s, %s, %s, %s, %s, %s);',
                    (host, version, x_min, y_min, x_max, y_max, srid)
                )

                response = cursor.fetchall()[0]

            return HttpResponse(response, content_type='application/gml+xml')
