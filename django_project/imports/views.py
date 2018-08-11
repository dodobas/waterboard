# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.shortcuts import render, redirect
from django.db import connection, transaction
from django.conf import settings
import json

from django.views import View
from .forms import UploadFileForm, InsertDataForm

from common.mixins import LoginRequiredMixin

from .processing.upload_file import core_upload_function
from .models import TaskHistory


class ImportData(LoginRequiredMixin, View):
    stop_error = False
    errors = None
    report_list = None
    obj = None

    def post(self, request):
        form_upload = UploadFileForm(request.POST, request.FILES)
        form_insert = InsertDataForm(request.POST)

        if form_upload.is_valid():

            try:
                records_for_add, records_for_update, warnings, errors, report_list = core_upload_function(request.FILES['file'])
                obj = form_upload.save(commit=False)

                obj.webuser = request.user
                obj.save()

                warning_msgs = ''
                for item in warnings:
                    warning_msgs += item + '<br>'

                error_msgs = ''
                for item in errors:
                    error_msgs += item + '<br>'
                error_msgs = error_msgs.replace('<new>', '&ltnew&gt')

                f = TaskHistory(changed_at=obj.uploaded_at, old_state='n', new_state='u',
                                file_name=str(obj.file).split('/')[-1], webuser_id=request.user.id, task_id=obj.id,
                                error_msgs=error_msgs, warning_msgs=warning_msgs, report_list=report_list)
                f.save()

                return render(request, 'import_data/import_data_page.html', {'form': {'form_upload': form_upload, 'form_insert': form_insert}, 'errors': errors, 'report_list': report_list, 'obj': obj, 'warnings': warnings})

            except ValueError as error:
                stop_error = True
                stop_error_msg = error.args[0]
                return render(request, 'import_data/import_data_page.html', {'form': {'form_upload': form_upload}, 'stop_error': stop_error, 'stop_error_msg': stop_error_msg})

    def get(self, request):
        form_upload = UploadFileForm()
        form_insert = InsertDataForm()

        return render(request, 'import_data/import_data_page.html', {'form': {'form_upload': form_upload, 'form_insert': form_insert}})


class InsertData(LoginRequiredMixin, View):
    def get(self, request, obj_id):
        obj_id = int(obj_id)

        with connection.cursor() as cur:
            cur.execute("""
                     SELECT imports_task.file FROM public.imports_task WHERE imports_task.id = %i
                                                    """ % obj_id)
            filename = settings.MEDIA_ROOT + '/' + cur.fetchone()[0]

        records_for_add, records_for_update, warnings, errors, report_list = core_upload_function(filename)

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

        f = TaskHistory(old_state='u', new_state='i', file_name=filename.split('/')[-1], webuser_id=request.user.id, task_id=obj_id, report_list=report_list)
        f.save()

        return redirect('/import_history')


class ImportHistory(LoginRequiredMixin, View):
    def get(self, request):
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute('SELECT task_id, file_name, changed_at, new_state, imports_task.webuser_id FROM public.imports_task INNER JOIN public.imports_taskhistory ON public.imports_task.id = public.imports_taskhistory.task_id WHERE public.imports_task.webuser_id=%i ORDER BY changed_at DESC' % request.user.id)

                uploaded_files_states = cursor.fetchall()

        history_list = []
        for item in uploaded_files_states:
            if item[3] == 'u':
                file_name = item[1].split('/')[-1]
                if len(file_name.split('.')[0].split('_')[-1]) == 7:
                    file_name = file_name.split('.')[0][0:-8] + '.' + file_name.split('.')[1]
                history_list.append([item[0], item[2], file_name, None])

        for item in uploaded_files_states:
            if item[3] == 'i':
                for item2 in history_list:
                    if item2[0] == item[0]:
                        item2[3] = item[2]

        return render(request, 'import_history/import_history_page.html', {'history_list': history_list})


class FileHistory(LoginRequiredMixin, View):
    def get(self, request, file_id):
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    'SELECT * FROM public.imports_taskhistory WHERE imports_taskhistory.webuser_id=%s AND imports_taskhistory.task_id=%s ORDER BY public.imports_taskhistory.new_state DESC;' % (request.user.id, file_id))

                file_history_list = cursor.fetchall()

        file_state_list = []
        for item in file_history_list:
            changed_at = item[1]
            new_state = item[3]
            error_msgs = item[5]
            warning_msgs = item[9]
            if item[6] != '':
                report_list = json.loads(item[6])
            else:
                report_list = ''
            file_state_list.append([changed_at, new_state, error_msgs, report_list, file_id, warning_msgs])

        return render(request, 'import_history/task_history_page.html', {'file_state_list': file_state_list})
