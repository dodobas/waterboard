# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.db import connection, transaction
from django.shortcuts import redirect, render
from django.views import View

from common.mixins import LoginRequiredMixin


class ChangesetsExplorerView(LoginRequiredMixin, View):

    def get(self, request):
        if not request.user.is_staff:
            return redirect('admin-control/')

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT changeset_id, to_char(changed_at, 'YYYY-MM-DD HH24:MI:SS TZ'), email
                    FROM (public.imports_task INNER JOIN public.webusers_webuser
                        ON webusers_webuser.id = imports_task.webuser_id) INNER JOIN public.imports_taskhistory
                        ON imports_task.id = imports_taskhistory.task_id
                    WHERE new_state = 'i'
                    ORDER BY changed_at DESC;
                    """
                )

                changesets = cursor.fetchall()

        changesets_list = []
        for item in changesets:
            changeset = {'changeset_id': item[0], 'imported_at': item[1], 'imported_by': item[2]}
            changesets_list.append(changeset)

        return render(request, 'changesets/changeset_explorer_page.html', {'changesets_list': changesets_list})


class ChangesetReportView(LoginRequiredMixin, View):

    def get(self, request, changeset_id):
        if not request.user.is_staff:
            return redirect('/admin-control/')

        with connection.cursor() as cur:
            cur.execute('select * from core_utils.get_attributes()')
            attributes = cur.fetchone()[0]

        return render(request, 'changesets/changeset_table_report_page.html', {
            'attributes': attributes, 'changeset_id': changeset_id
        })
