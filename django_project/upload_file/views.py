# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.db import connection, transaction
from django.conf import settings
import json

from .forms import UploadFileForm, InsertDataForm

from .upload_file_functions.upload_file import core_upload_function


@login_required
def model_form_upload_file(request):
    stop_error = False
    errors = None
    report_list = None
    obj = None
    discarded_msg = None

    if request.method == 'POST':
        form_upload = UploadFileForm(request.POST, request.FILES)
        form_insert = InsertDataForm(request.POST)

        if form_upload.is_valid():

            try:
                records_for_add, records_for_update, discarded_msg, errors, report_list, extension = core_upload_function(request.FILES['file'])
            except BlockingIOError as error:
                stop_error = True
                stop_error_msg = error.args[0]
            except FileNotFoundError as error:
                stop_error = True
                stop_error_msg = error.args[0]
            except KeyError as error:
                stop_error = True
                stop_error_msg = error.args[0]
            except LookupError as error:
                stop_error = True
                stop_error_msg = error.args[0]

            if not stop_error:
                obj = form_upload.save()

                obj.file_format = extension
                obj.save()

    else:
        form_upload = UploadFileForm()
        form_insert = InsertDataForm()


    if stop_error:
        return render(request, 'upload_file/upload_file_page.html', {'form': {'form_upload': form_upload}, 'stop_error': stop_error, 'stop_error_msg': stop_error_msg})
    else:
        return render(request, 'upload_file/upload_file_page.html', {'form': {'form_upload': form_upload, 'form_insert': form_insert}, 'errors': errors, 'report_list': report_list, 'obj': obj, 'discarded_msg': discarded_msg})


@login_required
def insert_data(request, obj_id):
    obj_id = int(obj_id)

    with connection.cursor() as cur:
        cur.execute("""
             SELECT upload_file_document.file FROM public.upload_file_document WHERE upload_file_document.id = %i
                                            """ % (obj_id))
        filename = settings.MEDIA_ROOT + '/' + cur.fetchone()[0]

    records_for_add, records_for_update, discarded_records, errors, report_list, extension = core_upload_function(filename)

    if len(records_for_add) > 0:
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    for record in records_for_add:
                        cursor.execute(
                            'select core_utils.create_feature(%s, ST_SetSRID(ST_Point(%s, %s), 4326), %s) ', (
                                request.user.pk,

                                float(record['longitude']),
                                float(record['latitude']),

                                json.dumps(record)
                            )
                        )
        except Exception:
            raise

    if len(records_for_update) > 0:
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    for record in records_for_update:
                        cursor.execute(
                            'select core_utils.update_feature(%s, %s, ST_SetSRID(ST_Point(%s, %s), 4326), %s) ', (
                                record['feature_uuid'],
                                request.user.pk,

                                float(record['longitude']),
                                float(record['latitude']),

                                json.dumps(record)
                            )
                        )
        except Exception:

            raise

    return render(request, 'upload_file/insert_data_page.html', {'report_list': report_list})
