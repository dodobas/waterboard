# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json
from os.path import split

from django.conf import settings
from django.db import connection, transaction
from django.shortcuts import redirect, render
from django.views import View

from common.mixins import LoginRequiredMixin

from .forms import ImportDataForm, UploadFileForm
from .models import TaskHistory
from .processing.upload_file import core_upload_function


class ImportData(LoginRequiredMixin, View):
    stop_error = False
    errors = None
    report_list = None
    task = None

    def post(self, request):
        form_upload = UploadFileForm(request.POST, request.FILES)
        form_import = ImportDataForm(request.POST)

        if form_upload.is_valid():

            try:
                records_for_add, records_for_update, warnings, errors, report_list = core_upload_function(
                    request.FILES['file'])
                task = form_upload.save(commit=False)

                task.webuser = request.user
                task.save()

                warning_msgs = ''
                for item in warnings:
                    warning_msgs += item + '<br>'

                error_msgs = ''
                for item in errors:
                    error_msgs += item + '<br>'
                error_msgs = error_msgs.replace('<new>', '&ltnew&gt')

                f = TaskHistory(changed_at=task.uploaded_at, old_state='n', new_state='u',
                                file_name=str(task.file).split('/')[-1], webuser_id=request.user.id, task_id=task.id,
                                error_msgs=error_msgs, warning_msgs=warning_msgs, report_list=report_list)
                f.save()

                return render(request, 'imports/import_data_page.html',
                              {'form': {'form_upload': form_upload, 'form_import': form_import}, 'errors': errors,
                               'report_list': report_list, 'task_id': task.pk, 'warnings': warnings})

            except ValueError as error:
                stop_error = True
                stop_error_msg = error.args[0]
                return render(request, 'imports/import_data_page.html',
                              {'form': {'form_upload': form_upload}, 'stop_error': stop_error,
                               'stop_error_msg': stop_error_msg})

    def get(self, request):
        form_upload = UploadFileForm()
        form_import = ImportDataForm()

        return render(request, 'imports/import_data_page.html',
                      {'form': {'form_upload': form_upload, 'form_import': form_import}})


class ImportDataTask(LoginRequiredMixin, View):
    def get(self, request, task_id):
        obj_id = int(task_id)

        with connection.cursor() as cur:
            cur.execute("""
                     SELECT imports_task.file FROM public.imports_task WHERE imports_task.id = %s
                                                    """, [task_id])
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

        task_history = TaskHistory(old_state='u', new_state='i', file_name=split(filename)[1], webuser_id=request.user.id,
                        task_id=task_id, report_list=report_list)
        task_history.save()

        return redirect('/import_history')


class ImportHistory(LoginRequiredMixin, View):
    def get(self, request):
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute("""
                            SELECT task_id, file_name, changed_at, new_state, imports_task.webuser_id FROM public.imports_task INNER JOIN public.imports_taskhistory ON public.imports_task.id = public.imports_taskhistory.task_id WHERE public.imports_task.webuser_id=%s ORDER BY changed_at DESC
                                                    """, [request.user.id])

                task_history_states = cursor.fetchall()

        history_list = []
        for task_id, file_name, changed_at, new_state, _ in task_history_states:
            if new_state == TaskHistory.STATE_UPLOADED:
                history_list.append([task_id, changed_at, file_name, None])

        for task_id, _, changed_at, new_state, _ in task_history_states:
            if new_state == TaskHistory.STATE_INSERTED:
                for index, (task_id2, _, _, _) in enumerate(history_list):
                    if task_id2 == task_id:
                        history_list[index][3] = changed_at

        return render(request, 'imports/import_history_page.html', {'history_list': history_list})


class TaskHistoryView(LoginRequiredMixin, View):
    def get(self, request, task_id):
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute("""
                            SELECT changed_at, new_state, error_msgs, warning_msgs, report_list FROM public.imports_taskhistory WHERE imports_taskhistory.webuser_id=%s AND imports_taskhistory.task_id=%s ORDER BY public.imports_taskhistory.changed_at ASC
                                                    """, [request.user.id, task_id])

                file_history_list = cursor.fetchall()

        task_state_list = []
        for changed_at, new_state, error_msgs, warning_msgs, report_list in file_history_list:
            if report_list != '':
                report_list = json.loads(report_list)
            else:
                report_list = ''
            task_state_list.append([changed_at, new_state, error_msgs, report_list, task_id, warning_msgs])

        return render(request, 'imports/task_history_page.html', {'task_state_list': task_state_list})
