from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponse
from django.views import View

from .tasks import csv_export, shp_export, xlsx_export, kml_export


class ExportData(LoginRequiredMixin, View):
    allowed_filters = ('zone', 'woreda', 'tabiya', 'kushet')

    def get(self, request, export_type, *args, **kwargs):

        changeset_id = request.GET.get('changeset_id')

        search_predicates = []

        for filter in self.allowed_filters:
            filter_values = [
                f'$${filter_value}$$'
                for filter_value in self.request.GET.getlist(filter)
                if filter_value
            ]

            if filter_values:
                search_predicates.append(f'{filter} IN ({",".join(filter_values)})')

        search_values = request.GET.get('search', '').split(' ')

        if search_values:

            search_predicates += [
                f"coalesce(name, '')||' '||coalesce(unique_id, '') ILIKE '%{search_value}%'"
                for search_value in search_values
                if search_value
            ]

        if search_predicates:
            search_predicate = ' WHERE '

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

        elif export_type == 'kml':
            output = HttpResponse(content_type='application/vnd.google-earth.kml+xml')

            filename, response = kml_export(output, search_predicate, changeset_id)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

            return response

        else:
            raise ValueError(f'Unknown export type: "{export_type}"')
