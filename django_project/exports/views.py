from __future__ import absolute_import, division, print_function, unicode_literals

from django.http import HttpResponse
from django.views import View

from common.mixins import LoginRequiredMixin

from .tasks import csv_export, shp_export, xlsx_export


class ExportData(LoginRequiredMixin, View):
    def get(self, request, export_type, *args, **kwargs):

        search_values = request.GET.get('search', '').split(' ')
        changeset_id = request.GET.get('changeset_id')

        if search_values:
            search_predicate = ' WHERE '

            search_predicates = (
                f"zone||' '||woreda||' '||tabiya||' '||kushet||' '||coalesce(name)||' '||unique_id ILIKE '%{search_value}%'"
                for search_value in search_values
            )

            search_predicate += ' AND '.join(search_predicates)
        else:
            search_predicate = None

        if export_type == 'csv':
            output = HttpResponse(content_type='text/csv')

            filename, response = csv_export(output, search_predicate, changeset_id)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

            return response

        elif export_type == 'xlsx':
            output = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

            filename, response = xlsx_export(output, search_predicate, changeset_id)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

            return response

        elif export_type == 'shp':
            output = HttpResponse(content_type='application/zip')

            filename, response = shp_export(output, search_predicate, changeset_id)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

            return response

        else:
            raise ValueError(f'Unknown export type: "{export_type}"')
