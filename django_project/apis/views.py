import json

from django import forms
from django.core.exceptions import ValidationError
from django.db import connection, transaction
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


class CreateFeature(View):

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
                    'select core_utils.create_feature(%s, ST_SetSRID(ST_Point(%s, %s), 4326), %s) ', (
                        self.request.user.pk,

                        float(payload['longitude']),
                        float(payload['latitude']),

                        json.dumps(payload)
                    )
                )

                created_feature_uuid = cursor.fetchone()[0]

        # TODO: what do we return here?
        return HttpResponse(content=json.dumps(dict(created_feature_uuid=created_feature_uuid)), content_type='application/json')


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
                # update_feature fnc updates also public.active_data
                cursor.execute(
                    'select core_utils.update_feature(%s, %s, ST_SetSRID(ST_Point(%s, %s), 4326), %s) ', (
                        feature_uuid,
                        self.request.user.pk,

                        float(payload['longitude']),
                        float(payload['latitude']),

                        json.dumps(payload)
                    )
                )

                updated_feature_json = cursor.fetchone()[0]

        # TODO: what do we return here?
        return HttpResponse(content=json.dumps(dict(updated_feature_json=updated_feature_json)), content_type='application/json')


def validate_payload(attr_spec, payload):

    errors = {}
    errors['total_errors'] = 0

    for attr in attr_spec:
        key = attr['key']

        value = payload.get(key, None)

        if attr['result_type'] == 'Integer':
            field = forms.IntegerField(
                required=attr['required'], min_value=attr['min_value'], max_value=attr['max_value']
            )

        elif attr['result_type'] == 'Decimal':
            field = forms.DecimalField(
                decimal_places=8, required=attr['required'], min_value=attr['min_value'], max_value=attr['max_value']
            )

        elif attr['result_type'] == 'Text':
            field = forms.CharField(max_length=attr['max_length'], required=attr['required'])

        elif attr['result_type'] == 'DropDown':
            field = forms.CharField(max_length=attr['max_length'], required=attr['required'])
        else:
            raise ValueError(f'Unknown result_type: {attr["result_type"]}')

        try:
            transformed_value = field.to_python(value)
            validated_value = field.clean(transformed_value)
        except ValidationError as err:
            errors[key] = [e.message for e in err.error_list]
            errors['total_errors'] += len(errors[key])

    return errors
