from __future__ import absolute_import, division, print_function, unicode_literals

from django.http import HttpResponse
from django.views import View

from common.mixins import LoginRequiredMixin

from .tasks import csv_export, shp_export, xlsx_export


class ExportData(LoginRequiredMixin, View):
    def get(self, request, export_type, *args, **kwargs):
        if export_type == 'csv':
            output = HttpResponse(content_type='text/csv')

            filename, response = csv_export(output)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

            return response

        elif export_type == 'xlsx':
            output = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

            filename, response = xlsx_export(output)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

            return response

        elif export_type == 'shp':
            output = HttpResponse(content_type='application/zip')

            filename, response = shp_export(output)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

            return response

        else:
            raise ValueError(f'Unknown export type: "{export_type}"')
