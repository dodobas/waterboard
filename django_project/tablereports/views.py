# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import csv
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
from common.utils import grouper

from xlsxlite.writer import XLSXBook



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

        # TODO: use pg_trgm extension to handle unbounded LIKE searches???, speed is not a problem with 18000 features
        search_values = request.POST.get('search[value]', '').split(' ')

        if search_values:
            search_predicate = 'WHERE '

            search_predicates = (
                f"zone||' '||woreda||' '||tabiya||' '||kushet||' '||name ILIKE '%{search_value}%'"
                for search_value in search_values
            )

            search_predicate += ' AND '.join(search_predicates)
        else:
            search_predicate = None

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
                (self.request.user.id, limit, offset, order_text, search_predicate)
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

        point_data = csv.reader(data_buffer)

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

        with fiona.open(shp_filename, 'w', driver=ogr_driver, crs=crs, schema=schema, encoding='utf-8') as new_shp:
            for fields in point_data:
                rec = dict()

                rec['geometry'] = {u'type': u'Point', u'coordinates': wkb_r.read(bytes(fields[0], 'ascii')).coords}

                rec['properties'] = {
                    properties[idx]: value for idx, value in enumerate(fields[1:], start=0)
                }

                new_shp.write(record=rec)

        # zip the directory
        zip_filename = shutil.make_archive(tempfile.mktemp(), 'zip', tempdir)

        response = HttpResponse(open(zip_filename, 'rb'), content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="waterpoints_{}.zip"'.format(export_time)

        return response


class XLSXDownload(LoginRequiredMixin, View):

    def get(self, request, *args, **kwargs):

        with connection.cursor() as cur:
            cur.execute("""
                select * from  core_utils.export_all()
            """)

            query = cur.fetchone()[0]
            data_buffer = StringIO()
            cur.copy_expert(query, data_buffer)

            data_buffer.seek(0)

            csv_reader = csv.reader(data_buffer, dialect='excel')

            book = XLSXBook()
            sheet1 = book.add_sheet("waterpoints")
            header = next(csv_reader)
            sheet1.append_row(*header)

            cur.execute("""
                 SELECT attributes_attribute.key, attributes_attribute.result_type FROM public.attributes_attribute
                                                """)
            key_result_type = cur.fetchall()
            keys = []
            result_types = []
            for item in key_result_type:
                keys.append(item[0])
                result_types.append(item[1])

            header_type = []
            for item in header:
                if item in keys:
                    Type = result_types[keys.index(item)]
                    if Type == 'DropDown' or Type == 'Text':
                        header_type.append('str')
                    elif Type == 'Decimal':
                        header_type.append('dec')
                    elif Type == 'Integer':
                        header_type.append('int')
                    else:
                        header_type.append('str')
                else:
                    header_type.append('str')

            for row in csv_reader:
                for cell in row:
                    if header_type[row.index(cell)] == 'int' and cell != '':
                        row[row.index(cell)] = int(cell)
                    elif header_type[row.index(cell)] == 'dec' and cell != '':
                        row[row.index(cell)] = float(cell)
                sheet1.append_row(*row)

            filename = 'waterpoints_{}.xlsx'.format(time.strftime('%Y%m%d_%H%M%S', time.gmtime()))
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename="{}"'.format(filename)
            book.finalize(to_file=response)

            return response
