# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.db import connection, transaction
from django.shortcuts import render
from django.views import View

from common.mixins import AdminRequiredMixin


class ChangesetsExplorerView(AdminRequiredMixin, View):

    def get(self, request):

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT features.changeset.id, to_char(ts_created, 'YYYY-MM-DD HH24:MI:SS TZ'), email, changeset_type
                    FROM features.changeset INNER JOIN public.webusers_webuser
                    ON features.changeset.webuser_id = public.webusers_webuser.id
                    ORDER BY ts_created DESC;
                    """
                )

                changesets = cursor.fetchall()

        changesets_list = []
        for item in changesets:
            changeset = {'changeset_id': item[0], 'ts_created': item[1], 'email': item[2], 'changeset_type': item[3]}
            changesets_list.append(changeset)

        return render(request, 'changesets/changeset_explorer_page.html', {'changesets_list': changesets_list})


class ChangesetReportView(AdminRequiredMixin, View):

    def get(self, request, changeset_id):
        with connection.cursor() as cur:
            cur.execute('select * from core_utils.get_attributes()')
            attributes = cur.fetchone()[0]

        return render(request, 'changesets/changeset_table_report_page.html', {
            'attributes': attributes, 'changeset_id': changeset_id
        })
