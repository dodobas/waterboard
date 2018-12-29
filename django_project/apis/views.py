import datetime
import json
import uuid

from django.db import connection, transaction
from django.http import HttpResponse
from django.utils import timezone
from django.views import View

from .utils import validate_payload


class FeatureSpec(View):
    def get(self, request, feature_uuid):

        with connection.cursor() as cur:
            cur.execute("""select * from core_utils.feature_spec(%s, True)""", [feature_uuid])

            data = cur.fetchone()[0]

        if data == '{}':
            return HttpResponse(content=data, status=404, content_type='application/json')
        else:
            return HttpResponse(content=data, content_type='application/json')


class FeatureSpecForChangeset(View):
    def get(self, request, feature_uuid, changeset_id):

        with connection.cursor() as cur:
            cur.execute("""select * from core_utils.feature_spec(%s, %s, %s)""", [feature_uuid, True, changeset_id])

            data = cur.fetchone()[0]

        if data == '{}':
            return HttpResponse(content=data, status=404, content_type='application/json')
        else:
            return HttpResponse(content=data, content_type='application/json')


class FeatureHistory(View):
    def get(self, request, feature_uuid):

        end_date = timezone.now()
        start_date = end_date - datetime.timedelta(weeks=104)

        with connection.cursor() as cur:
            cur.execute(
                'SELECT * FROM core_utils.get_feature_history_by_uuid(%s::uuid, %s, %s)',
                (feature_uuid, start_date, end_date)
            )
            data = cur.fetchone()[0]

        if data is None:
            return HttpResponse(content='[]', status=404, content_type='application/json')
        else:
            return HttpResponse(content=data, content_type='application/json')


class CreateFeature(View):
    def get(self, request):

        # generate a new uuid
        feature_uuid = uuid.uuid4()

        with connection.cursor() as cur:
            cur.execute("""select * from core_utils.feature_spec(%s, False)""", [feature_uuid])

            data = cur.fetchone()[0]

        return HttpResponse(content=data, content_type='application/json')

    def post(self, request):

        errors = {}
        payload = json.loads(request.body)

        feature_uuid = payload['feature_uuid']

        if feature_uuid is None:
            raise ValueError

        # check if feature already exists
        with connection.cursor() as cur:
            cur.execute('select true from features.active_data where feature_uuid = %s', (feature_uuid, ))
            feature_already_exists = cur.fetchone()

            if feature_already_exists:
                errors['***'] = [
                    f'Feature with uuid {feature_uuid} already exists, can not create new feature with uuid that exists'
                ]
                return HttpResponse(content=json.dumps(errors), content_type='application/json', status=400)

        with connection.cursor() as cur:
            cur.execute('select * from core_utils.get_attributes()')
            attributes = json.loads(cur.fetchone()[0])

        # validate the payload
        errors.update(validate_payload(attributes, payload))

        if errors['total_errors'] > 0:
            return HttpResponse(content=json.dumps(errors), content_type='application/json', status=400)

        # data is valid

        with transaction.atomic():
            with connection.cursor() as cursor:

                cursor.execute(
                    'INSERT INTO features.changeset (webuser_id, changeset_type) VALUES (%s, %s) RETURNING id', (
                        self.request.user.pk, 'U'
                    )
                )
                changeset_id = cursor.fetchone()[0]

                cursor.execute(
                    'select core_utils.create_feature(%s, %s, ST_SetSRID(ST_Point(%s, %s), 4326), %s) ', (
                        changeset_id,

                        feature_uuid,
                        float(payload['longitude']),
                        float(payload['latitude']),

                        json.dumps(payload)
                    )
                )

                created_feature = cursor.fetchone()[0]

        # TODO: what do we return here?
        return HttpResponse(content=created_feature, content_type='application/json')


class UpdateFeature(View):

    def post(self, request, feature_uuid):

        payload = json.loads(request.body)

        with connection.cursor() as cur:
            cur.execute('select * from core_utils.get_attributes()')
            attributes = json.loads(cur.fetchone()[0])

        errors = validate_payload(attributes, payload)

        if errors['total_errors'] > 0:
            return HttpResponse(content=json.dumps(errors), content_type='application/json', status=400)

        # data is valid
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    'INSERT INTO features.changeset (webuser_id, changeset_type) VALUES (%s, %s) RETURNING id', (
                        self.request.user.pk, 'U'
                    )
                )
                changeset_id = cursor.fetchone()[0]

                # update_feature fnc updates also public.active_data
                cursor.execute(
                    'select core_utils.update_feature(%s, %s, ST_SetSRID(ST_Point(%s, %s), 4326), %s) ', (
                        changeset_id,
                        feature_uuid,

                        float(payload['longitude']),
                        float(payload['latitude']),

                        json.dumps(payload)
                    )
                )

                updated_feature_json = cursor.fetchone()[0]

        # TODO: what do we return here?
        return HttpResponse(content=updated_feature_json, content_type='application/json')
