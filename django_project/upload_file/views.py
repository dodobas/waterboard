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
    if request.method == 'POST':
        form_upload = UploadFileForm(request.POST, request.FILES)
        form_insert = InsertDataForm(request.POST)

        if form_upload.is_valid():
            records_for_add, records_for_update, discarded_msg, errors, report_list, extension = core_upload_function(request.FILES['file'])
            if records_for_add != False:
                obj = form_upload.save()

                obj.file_format = extension
                obj.save()

    else:
        form_upload = UploadFileForm()
        form_insert = InsertDataForm()

    try:

        if records_for_add == False:
            return render(request, 'upload_file/upload_file_page.html', {'form': {'form_upload': form_upload, 'form_insert': form_insert}, 'errors': errors, 'records_for_add': records_for_add, 'error_stop': records_for_update, 'report_list': report_list})
        else:
            return render(request, 'upload_file/upload_file_page.html', {'form': {'form_upload': form_upload, 'form_insert': form_insert}, 'errors': errors, 'records_for_add': records_for_add, 'error_stop': None, 'report_list': report_list, 'obj': obj, 'discarded_msg': discarded_msg})
    except UnboundLocalError:
        return render(request, 'upload_file/upload_file_page.html', {'form': {'form_upload': form_upload, 'form_insert': form_insert}})

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

    if request.session.get('records_for_update'):
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    for record in records_for_update:
                        cursor.execute(
                            'select core_utils.update_feature(%s, ST_SetSRID(ST_Point(%s, %s), 4326), %s) ', (
                                request.user.pk,

                                float(record['longitude']),
                                float(record['latitude']),

                                json.dumps(record)
                            )
                        )
        except Exception:

            raise

    return render(request, 'upload_file/insert_data_page.html', {'report_list': report_list})
