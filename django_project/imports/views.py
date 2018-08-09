# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.db import connection, transaction
from django.conf import settings
import json

from .forms import UploadFileForm, InsertDataForm

from .processing.upload_file import core_upload_function
from .models import TaskHistory


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
            except ValueError as error:
                stop_error = True
                stop_error_msg = error.args[0]

            if not stop_error:
                obj = form_upload.save(commit=False)

                obj.file_format = extension
                obj.webuser = request.user
                obj.save()

                error_msgs = discarded_msg.replace('<new>', '&ltnew&gt')
                for item in errors:
                    error_msgs += '<br>' + item

                f = TaskHistory(changed_at=obj.uploaded_at, old_state='n', new_state='u', file_name=str(obj.file).split('/')[-1], webuser_id=request.user.id, task_id=obj.id, error_msgs=error_msgs, report_list=report_list)
                f.save()
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
             SELECT imports_task.file FROM public.imports_task WHERE imports_task.id = %i
                                            """ % obj_id)
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

    f = TaskHistory(old_state='u', new_state='i', file_name=filename.split('/')[-1], webuser_id=request.user.id, task_id=obj_id)
    f.save()

    return render(request, 'upload_file/insert_data_page.html', {'report_list': report_list})


@login_required
def upload_history(request):
    with transaction.atomic():
        with connection.cursor() as cursor:
            cursor.execute('SELECT * FROM public.imports_task WHERE imports_task.webuser_id=%s' % request.user.id)

            uploaded_files_list = cursor.fetchall()

    history_list = []
    for item in uploaded_files_list:
        file_name = item[2].split('/')[-1]
        if len(file_name.split('.')[0].split('_')[-1]) == 7:
            file_name = file_name.split('.')[0][0:-8] + '.' + file_name.split('.')[1]
        history_list.append([item[0], item[1], file_name])

    return render(request, 'upload_history/upload_history_page.html', {'history_list': reversed(history_list)})


@login_required
def file_history(request, file_id):
    with transaction.atomic():
        with connection.cursor() as cursor:
            cursor.execute('SELECT * FROM public.imports_taskhistory WHERE imports_taskhistory.webuser_id=%s AND imports_taskhistory.task_id=%s ORDER BY public.imports_taskhistory.new_state DESC;' % (request.user.id, file_id))

            file_history_list = cursor.fetchall()

    file_state_list = []
    for item in file_history_list:
        changed_at = item[1]
        new_state = item[3]
        error_msgs = item[5]
        if item[6] != '':
            report_list = json.loads(item[6])
        else:
            report_list = ''
        file_state_list.append([changed_at, new_state, error_msgs, report_list, file_id])

    return render(request, 'upload_history/file_history_page.html', {'file_state_list': file_state_list})
