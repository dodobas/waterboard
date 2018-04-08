# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import os
import shutil
import tempfile
import time
from io import StringIO

import fiona

from django.contrib.gis.geos import WKBReader
from django.db import connection
from django.http import HttpResponse
from django.views import View
from django.views.generic import TemplateView

from common.mixins import LoginRequiredMixin
from common.utils import UnicodeReader, grouper


class TableReportView(LoginRequiredMixin, TemplateView):
    template_name = 'tablereports/table-report.html'

    def get_context_data(self, **kwargs):

        context = super(TableReportView, self).get_context_data(**kwargs)

        with connection.cursor() as cur:
            cur.execute('select * from core_utils.get_attributes()')
            attributes = cur.fetchone()[0]

        context.update({'attributes': attributes})

        return context


class TableDataView(LoginRequiredMixin, View):

    def post(self, request, *args, **kwargs):

        def parse_column_data(index):
            key = 'columns[{}][data]'.format(index)
            return request.POST.get(key)

        # TODO: datatables uses draw count to distinguish between requests
        # draw = int(request.POST.get('draw', -1))

        limit = int(request.POST.get('length', 10))
        offset = int(request.POST.get('start', 0))

        search_value = request.POST.get('search[value]', '')

        if search_value:
            search_value = "WHERE name ILIKE '%{}%'".format(search_value)

        order_keys = sorted([key for key in request.POST.keys() if key.startswith('order[')])

        order_text = ', '.join(
            '{} {}'.format(parse_column_data(request.POST.get(col)), request.POST.get(dir))
            for col, dir in grouper(order_keys, 2)
            if request.POST.get(dir) in ('asc', 'desc')  # poor mans' security
        )

        if order_text:
            order_text = 'ORDER BY {}'.format(order_text)

        with connection.cursor() as cur:
            cur.execute(
                'select data from core_utils.get_features(%s, %s, %s, %s, %s) as data;',
                (self.request.user.id, limit, offset, order_text, search_value)
            )
            data = cur.fetchone()[0]

        return HttpResponse(content=data, content_type='application/json')


class CSVDownload(LoginRequiredMixin, View):

    def get(self, request, *args, **kwargs):

        with connection.cursor() as cur:
            cur.execute("""
                select * from  core_utils.export_all()
            """)

            query = cur.fetchone()[0]

            filename = 'waterpoints_{}.csv'. format(time.strftime('%Y%m%d_%H%M%S', time.gmtime()))

            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="{}"'.format(filename)

            cur.copy_expert(query, response)

            return response


class SHPDownload(LoginRequiredMixin, View):

    def get(self, request, *args, **kwargs):

        tempdir = tempfile.mkdtemp()

        export_time = time.strftime('%Y%m%d_%H%M%S', time.gmtime())

        with connection.cursor() as cur:
            cur.execute("""
                select * from  core_utils.export_all()
            """)

            query = cur.fetchone()[0]

            data_buffer = StringIO()
            cur.copy_expert(query, data_buffer)

        # rewind the io object
        data_buffer.seek(0)

        point_data = UnicodeReader(data_buffer)

        header = next(point_data)
        # skip the first field, point_geom, trim to 10chars (SHP file limitation)
        properties = [prop.upper()[:10] for prop in header[1:]]

        # define basic geometry file properties
        ogr_driver = 'ESRI Shapefile'
        crs = {'no_defs': True, 'ellps': 'WGS84', 'datum': 'WGS84', 'proj': 'longlat'}
        schema = {
            'geometry': 'Point',
            'properties': {
                prop: 'str' for prop in properties
            }
        }

        shp_filename = os.path.join(tempdir, 'waterpoints_{}.shp'.format(export_time))

        wkb_r = WKBReader()

        with fiona.open(shp_filename, 'w', driver=ogr_driver, crs=crs, schema=schema) as new_shp:
            for fields in point_data:
                rec = dict()

                rec['geometry'] = {u'type': u'Point', u'coordinates': wkb_r.read(fields[0]).coords}

                rec['properties'] = {
                    properties[idx]: value for idx, value in enumerate(fields[1:], start=0)
                }

                new_shp.write(record=rec)

        # zip the directory
        zip_filename = shutil.make_archive(tempfile.mktemp(), 'zip', tempdir)

        response = HttpResponse(open(zip_filename, 'rb'), content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="waterpoints_{}.zip"'.format(export_time)

        return response
