import datetime

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import connection
from django.utils import timezone
from django.views.generic.base import TemplateView


class FeatureByUUID(LoginRequiredMixin, TemplateView):
    template_name = 'features/feature_by_uuid.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context['feature_uuid'] = self.kwargs.get('feature_uuid')

        end_date = timezone.now()
        start_date = end_date - datetime.timedelta(weeks=104)

        with connection.cursor() as cur:
            cur.execute(
                'SELECT * FROM core_utils.get_feature_history_by_uuid(%s::uuid, %s, %s)',
                (str(self.kwargs.get('feature_uuid')), start_date, end_date)
            )
            result = cur.fetchone()[0]
            context['feature_history'] = result if result else '[]'

            # TODO: select attribute by key and not by ID
            cur.execute(
                'SELECT * FROM core_utils.get_attribute_history_by_uuid(%s::uuid, %s, %s, %s)',
                (str(self.kwargs.get('feature_uuid')), 'yield', start_date, end_date)
            )
            result = cur.fetchone()[0]
            context['feature_attribute_data_yield'] = result if result else '[]'

            # TODO: select attribute by key and not by ID
            cur.execute(
                'SELECT * FROM core_utils.get_attribute_history_by_uuid(%s::uuid, %s, %s, %s)',
                (str(self.kwargs.get('feature_uuid')), 'static_water_level', start_date, end_date)
            )
            result = cur.fetchone()[0]
            context['feature_attribute_data_static'] = result if result else '[]'

        return context


class FeatureCreate(LoginRequiredMixin, TemplateView):
    template_name = 'features/create_feature.html'
