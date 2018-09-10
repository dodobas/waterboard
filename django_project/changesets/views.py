# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.db import connection, transaction
from django.shortcuts import render
from django.views import View

from common.mixins import AdminRequiredMixin
from core.settings.contrib import DEFAULT_PAGE_SIZE


class ChangesetsExplorerView(AdminRequiredMixin, View):

    def get(self, request):
        try:
            page_num = int(request.GET.get('page'))
        except (ValueError, TypeError):
            page_num = 1

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT features.changeset.id, to_char(ts_created, 'YYYY-MM-DD HH24:MI:SS TZ'), email
                    FROM features.changeset INNER JOIN public.webusers_webuser
                    ON features.changeset.webuser_id = public.webusers_webuser.id
                    ORDER BY ts_created DESC
                    OFFSET %s LIMIT %s;
                    """, ((page_num - 1) * DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE)
                )

                changesets = cursor.fetchall()

        changesets_list = []
        for item in changesets:
            changeset = {'changeset_id': item[0], 'ts_created': item[1], 'email': item[2]}
            changesets_list.append(changeset)

        next_page = page_num + 1

        if page_num == 1:
            previous_page = None
        else:
            previous_page = page_num - 1

        return render(request, 'changesets/changeset_explorer_page.html', {
            'changesets_list': changesets_list, 'next_page': next_page, 'previous_page': previous_page,
            'default_page_size': DEFAULT_PAGE_SIZE
        })


class ChangesetReportView(AdminRequiredMixin, View):

    def get(self, request, changeset_id):
        with connection.cursor() as cur:
            cur.execute('select * from core_utils.get_attributes()')
            attributes = cur.fetchone()[0]

        return render(request, 'changesets/changeset_table_report_page.html', {
            'attributes': attributes, 'changeset_id': changeset_id
        })
