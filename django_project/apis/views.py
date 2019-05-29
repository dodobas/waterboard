import datetime
import json
import uuid
import posixpath
from collections import defaultdict

from django.core.files.storage import default_storage
from django.db import connection, transaction
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import timezone
from django.views import View

from attachments.models import Attachment

from .utils import validate_payload, EMPTY_VALUES


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


class AttachmentsMixin:
    def handle_attachments(self, attributes, feature_uuid):
        # handle files
        for attr in attributes:
            if attr['result_type'] == 'Attachment':
                attachments = self.request.FILES.getlist(attr['key'])

                for attachment in attachments:
                    filename = posixpath.join('attachments', str(feature_uuid), attachment.name)
                    storage_filename = default_storage.generate_filename(filename)

                    saved_filename = default_storage.save(storage_filename, attachment)

                    new_attachment = Attachment(
                        attachment_uuid=uuid.uuid4(),
                        feature_uuid=feature_uuid,
                        attribute_key=attr['key'],
                        original_filename=attachment.name,
                        size=attachment.size,
                        content_type=attachment.content_type,
                        content_type_extra=attachment.content_type_extra,
                        filename=saved_filename
                    )
                    new_attachment.save()


class EmptyFeature(View):
    def get(self, request):

        # generate a new uuid
        feature_uuid = uuid.uuid4()

        with connection.cursor() as cur:
            cur.execute("""select * from core_utils.feature_spec(%s, False)""", [feature_uuid])

            data = cur.fetchone()[0]

        return HttpResponse(content=data, content_type='application/json')


class CreateFeature(AttachmentsMixin, View):
    def post(self, request, feature_uuid):
        errors = defaultdict(list)

        webuser = self.request.user

        feature_uuid = str(feature_uuid)

        if feature_uuid is None:
            raise ValueError

        if webuser.is_readonly:
            errors['***'].append('No privileges to create the water point')

        # check if feature already exists
        with connection.cursor() as cur:
            cur.execute('select true from features.active_data where feature_uuid = %s', (feature_uuid, ))
            feature_already_exists = cur.fetchone()

            if feature_already_exists:
                errors['***'].append(
                    f'Feature with uuid {feature_uuid} already exists, can not create new feature with uuid that exists'
                )

        if errors:
            return HttpResponse(content=json.dumps(errors), content_type='application/json', status=400)

        payload = json.loads(request.POST.get('attributes', '{}'))

        with connection.cursor() as cur:
            cur.execute('select * from core_utils.get_attributes()')
            attributes = json.loads(cur.fetchone()[0])

        # validate the payload
        errors.update(validate_payload(attributes, payload))

        if errors['total_errors'] > 0:
            return HttpResponse(content=json.dumps(errors), content_type='application/json', status=400)

        # data is valid, clean data
        cleaned_payload = {key: value if value not in EMPTY_VALUES else None for key, value in payload.items()}

        self.handle_attachments(attributes, feature_uuid)

        with transaction.atomic():
            with connection.cursor() as cursor:

                cursor.execute(
                    'INSERT INTO features.changeset (webuser_id, changeset_type) VALUES (%s, %s) RETURNING id', (
                        self.request.user.pk, 'U'
                    )
                )
                changeset_id = cursor.fetchone()[0]

                cursor.execute(
                    'select core_utils.create_feature(%s, %s, %s) ', (
                        changeset_id,

                        feature_uuid,

                        json.dumps(cleaned_payload)
                    )
                )

                created_feature = cursor.fetchone()[0]

        # TODO: what do we return here?
        return HttpResponse(content=created_feature, content_type='application/json')


def _update_feature(webuser_id, feature_uuid, cleaned_payload, changeset_type='U'):
    with transaction.atomic():
        with connection.cursor() as cursor:
            cursor.execute(
                'INSERT INTO features.changeset (webuser_id, changeset_type) VALUES (%s, %s) RETURNING id', (
                    webuser_id, changeset_type
                )
            )
            changeset_id = cursor.fetchone()[0]

            # update_feature fnc updates also public.active_data
            cursor.execute(
                'select core_utils.update_feature(%s, %s, %s) ', (
                    changeset_id,
                    feature_uuid,

                    json.dumps(cleaned_payload)
                )
            )

            return cursor.fetchone()[0]


class UpdateFeature(AttachmentsMixin, View):

    def post(self, request, feature_uuid):
        errors = defaultdict(list)

        webuser = self.request.user

        if webuser.is_readonly:
            errors['***'].append('No privileges to create the water point')

        if errors:
            return HttpResponse(content=json.dumps(errors), content_type='application/json', status=400)

        payload = json.loads(request.POST.get('attributes', '{}'))

        with connection.cursor() as cur:
            cur.execute('select * from core_utils.get_attributes()')
            attributes = json.loads(cur.fetchone()[0])

        errors = validate_payload(attributes, payload)

        if errors['total_errors'] > 0:
            return HttpResponse(content=json.dumps(errors), content_type='application/json', status=400)

        # data is valid, clean data
        cleaned_payload = {key: value if value not in EMPTY_VALUES else None for key, value in payload.items()}

        feature_uuid = str(feature_uuid)

        self.handle_attachments(attributes, feature_uuid)

        updated_feature_json = _update_feature(self.request.user.pk, feature_uuid, cleaned_payload)

        # TODO: what do we return here?
        return HttpResponse(content=updated_feature_json, content_type='application/json')


class DeleteFeature(View):
    def delete(self, request, feature_uuid):
        errors = defaultdict(list)

        webuser = self.request.user

        if webuser.is_readonly:
            errors['***'].append('No privileges to create the water point')

        if errors:
            return HttpResponse(content=json.dumps(errors), content_type='application/json', status=400)

        with connection.cursor() as cursor:
            cursor.execute('select * from core_utils.delete_feature(%s)', (feature_uuid, ))

            has_errors = cursor.fetchone()[0]

        if has_errors:
            return HttpResponse(content=has_errors, status=400)
        else:
            return HttpResponse(content=feature_uuid, status=204)


class AttributesSpec(View):
    def get(self, request):
        with connection.cursor() as cur:
            cur.execute("""select * from core_utils.attributes_spec()""")

            data = cur.fetchone()[0]

        return HttpResponse(content=data, content_type='application/json')


class TableReport(View):
    """
    {
        "offset": 0,
        "limit": 25,
        "search": "a search string",
        "filter": [
            {"zone": ["Central"]},
            {"woreda": ["Ahferom", "Adwa"]}
        ],
        "order": [
            {"zone": "asc"},
            {"fencing_exists": "desc"}
        ],
    }
    """

    def post(self, request):
        search_predicates = []

        try:
            payload = json.loads(request.body)

            limit = int(payload.get('limit', 10))

            offset = int(payload.get('offset', 0))

            t_changeset_id = payload.get('changeset_id')

            changeset_id = int(t_changeset_id) if t_changeset_id else None

            filter_values = payload.get('filter', [])

            if filter_values:
                search_predicates += [
                    f"{key} IN ({', '.join(f'$${usr_filter}$$' for usr_filter in usr_filters)})"
                    for item in filter_values

                    for key, usr_filters in item.items()
                ]

            search_values = payload.get('search', '').split(' ')

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

            order_data = payload.get('order', [])

            order_text = ', '.join([
                f"{item['value']} {item['name']}"
                for item in order_data
                # for key, direction in item.items()
                if item['name'] in ('asc', 'desc')
            ])

            if order_text:
                order_text = 'ORDER BY {}'.format(order_text)

            with connection.cursor() as cur:
                cur.execute(
                    'select data from core_utils.tablereport_data(%s, %s, %s, %s, %s, %s) as data;',
                    (self.request.user.id, limit, offset, order_text, search_predicate, changeset_id)
                )
                data = cur.fetchone()[0]

            return HttpResponse(content=data, content_type='application/json')

        except Exception as e:

            error_report = {
                "errors": [{
                    "code": 12345,
                    "message": f"Generic error report: {type(e)}",
                    "description": str(e)
                }]
            }

            return HttpResponse(content=json.dumps(error_report), content_type='application/json', status=400)


class DownloadAttachment(View):
    def get(self, request, attachment_uuid):

        try:
            attachment = Attachment.objects.get(attachment_uuid=attachment_uuid, is_active=True)
            return HttpResponseRedirect(default_storage.url(attachment.filename))
        except Attachment.DoesNotExist:
            return HttpResponse(status=404)


class DeleteAttachment(View):
    def delete(self, request, attachment_uuid):
        errors = defaultdict(list)

        webuser = self.request.user

        if webuser.is_readonly:
            errors['***'].append('No privileges to create the water point')

        if errors:
            return HttpResponse(content=json.dumps(errors), content_type='application/json', status=400)

        try:
            attachment = Attachment.objects.get(attachment_uuid=attachment_uuid)
            attachment.is_active = False
            attachment.save(update_fields=('is_active',))

            with connection.cursor() as cursor:
                cursor.execute(
                    'select * from core_utils.get_feature_by_uuid_for_changeset(%s)',
                    (attachment.feature_uuid,)
                )
                feature = json.loads(cursor.fetchone()[0])[0]

            _update_feature(self.request.user.pk, attachment.feature_uuid, feature, 'S')

        except Exception as e:
            return HttpResponse(content=str(e), status=400)
        else:
            return HttpResponse(content=attachment_uuid, status=204)
