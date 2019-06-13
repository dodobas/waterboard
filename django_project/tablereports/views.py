from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import connection
from django.views.generic import TemplateView


class TableReportView(LoginRequiredMixin, TemplateView):
    template_name = 'tablereports/table-report.html'

    def get_context_data(self, **kwargs):

        context = super().get_context_data(**kwargs)

        with connection.cursor() as cur:
            cur.execute('select * from core_utils.get_attributes()')
            attributes = cur.fetchone()[0]

        context.update({'attributes': attributes})

        return context
