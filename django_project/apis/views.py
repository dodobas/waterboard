from django.db import connection
from django.http import HttpResponse
from django.views import View


class FeatureSpec(View):
    def get(self, request, feature_uuid):

        with connection.cursor() as cur:
            cur.execute("""select * from core_utils.feature_spec(%s)""", [feature_uuid])

            data = cur.fetchone()[0]

        if data == '{}':
            return HttpResponse(content=data, status=404, content_type='application/json')
        else:
            return HttpResponse(content=data, content_type='application/json')
