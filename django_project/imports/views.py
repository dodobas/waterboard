# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json
from os.path import split

from django.core.files.storage import default_storage
from django.db import connection, transaction
from django.shortcuts import redirect, render
from django.views import View

from common.mixins import AdminRequiredMixin

from .forms import ImportDataForm, UploadFileForm
from .models import TaskHistory
from .processing.errors import FileError, MultipleUuidError, NoRequiredColumnError, UnnamedColumnError
from .processing.processing_main import process_file


class ImportData(AdminRequiredMixin, View):
    stop_error = False
    errors = None
    report_list = None
    task = None

    def post(self, request):
        form_upload = UploadFileForm(request.POST, request.FILES)
        form_import = ImportDataForm(request.POST)

        if form_upload.is_valid():

            try:
                records_for_add, records_for_update, warnings, errors, report_dict = process_file(request.FILES['file'])
            except (FileError, ValueError, UnnamedColumnError, MultipleUuidError, NoRequiredColumnError) as error:
                stop_error = True
                stop_error_msg = [error.description] + [error.message]
                return render(request, 'imports/import_data_page.html', {
                    'form': {'form_upload': form_upload}, 'stop_error': stop_error, 'stop_error_msg': stop_error_msg})
            except Exception:
                stop_error = True
                stop_error_msg = ['Unexpected error occurred.']
                return render(request, 'imports/import_data_page.html', {
                    'form': {'form_upload': form_upload}, 'stop_error': stop_error, 'stop_error_msg': stop_error_msg})
            task = form_upload.save(commit=False)

            task.webuser_id = request.user.pk
            task.save()

            f = TaskHistory(
                changed_at=task.uploaded_at, old_state='n', new_state='u', webuser_id=request.user.id, task_id=task.id,
                errors=errors, warnings=warnings, report_dict=report_dict
            )
            f.save()

            return render(
                request, 'imports/import_data_page.html', {
                    'form': {'form_upload': form_upload, 'form_import': form_import}, 'errors': errors,
                    'report_dict': report_dict, 'task_id': task.pk, 'warnings': warnings
                }
            )

    def get(self, request):
        form_upload = UploadFileForm()
        form_import = ImportDataForm()

        return render(
            request, 'imports/import_data_page.html', {
                'form': {'form_upload': form_upload, 'form_import': form_import}
            }
        )


class ImportDataTask(AdminRequiredMixin, View):
    def get(self, request, task_id):
        task_id = int(task_id)

        with connection.cursor() as cur:
            cur.execute(
                """
                SELECT true
                FROM public.imports_taskhistory
                WHERE public.imports_taskhistory.task_id = %s AND public.imports_taskhistory.new_state = 'i';
                """, [task_id]
            )

            if cur.fetchone():
                return redirect('/import_history')
            else:
                pass

            cur.execute(
                """
                SELECT public.imports_task.file FROM public.imports_task WHERE imports_task.id = %s;
                """, [task_id]
            )

            pathname = default_storage.open(cur.fetchone()[0])

        records_for_add, records_for_update, warnings, errors, report_dict = process_file(pathname)

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    'INSERT INTO features.changeset (webuser_id, changeset_type) VALUES (%s, %s) RETURNING id', (
                        request.user.pk, 'I'
                    )
                )
                changeset_id = cursor.fetchone()[0]

                cursor.execute(
                    'UPDATE public.imports_task SET changeset_id = %s WHERE public.imports_task.id = %s', (
                        changeset_id,
                        task_id
                    )
                )

        if len(records_for_add) > 0:
            try:
                with transaction.atomic():
                    with connection.cursor() as cursor:
                        for record in records_for_add:
                            cursor.execute(
                                'SELECT core_utils.create_feature(%s, %s) ', (
                                    changeset_id,

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
                                """
                                SELECT core_utils.update_feature(%s, %s, %s)
                                """, (
                                    changeset_id,
                                    record['feature_uuid'],

                                    json.dumps(record)
                                )
                            )
            except Exception:
                raise

        task_history = TaskHistory(
            old_state='u', new_state='i', webuser_id=request.user.id, task_id=task_id, report_dict=report_dict
        )
        task_history.save()

        return redirect('/import_history')


class ImportHistory(AdminRequiredMixin, View):
    def get(self, request):
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT task_id, file, to_char(changed_at, 'YYYY-MM-DD HH24:MI:SS TZ'), new_state,
                        imports_task.webuser_id
                    FROM public.imports_task INNER JOIN public.imports_taskhistory
                        ON public.imports_task.id = public.imports_taskhistory.task_id
                    WHERE public.imports_task.webuser_id=%s
                    ORDER BY changed_at DESC;
                    """, [request.user.id]
                )

                task_history_states = cursor.fetchall()

        history_list = []
        for task_id, file_path, changed_at, new_state, _ in task_history_states:
            if new_state == TaskHistory.STATE_UPLOADED:
                file_name = split(file_path)[1]
                history_list.append({
                    'task_id': task_id, 'updated_at': changed_at, 'file_name': file_name, 'imported_at': None,
                     'file_path': default_storage.url(file_path)
                })

        for task_id, _, changed_at, new_state, _ in task_history_states:
            if new_state == TaskHistory.STATE_INSERTED:
                for index, item in enumerate(history_list):
                    if item['task_id'] == task_id:
                        history_list[index]['imported_at'] = changed_at

        return render(request, 'imports/import_history_page.html', {'history_list': history_list})


class TaskHistoryView(AdminRequiredMixin, View):
    def get(self, request, task_id):
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT to_char(changed_at, 'YYYY-MM-DD HH24:MI:SS TZ'), new_state, errors, warnings,
                        report_dict
                    FROM public.imports_taskhistory
                    WHERE imports_taskhistory.webuser_id=%s AND imports_taskhistory.task_id=%s
                    ORDER BY public.imports_taskhistory.changed_at ASC;
                    """, [request.user.id, task_id]
                )

                task_history_list = cursor.fetchall()

        task_state_list = []
        for changed_at, new_state, errors, warnings, report_dict in task_history_list:
            task_state_list.append({
                'changed_at': changed_at, 'new_state': new_state, 'errors': errors, 'report_dict': report_dict,
                'task_id': task_id, 'warnings': warnings
            })

        return render(request, 'imports/task_history_page.html', {'task_state_list': task_state_list})
