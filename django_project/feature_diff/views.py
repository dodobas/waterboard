# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json

from django.db import connection
from django.shortcuts import redirect, render
from django.views import View

from common.mixins import AdminRequiredMixin

from .utils import find_differences, get_metadata, integrate_data


# http://127.0.0.1:8000/difference_viewer/13b4f8b7-857d-48ac-ace2-b791b3094f6f/1/3
class DifferenceViewer(AdminRequiredMixin, View):

    def get(self, request, feature_uuid, **kwargs):

        with connection.cursor() as cursor:
            cursor.execute(
                'select changeset_id from features.history_data where feature_uuid = %s order by changeset_id desc;', (
                    str(feature_uuid),
                )
            )
            available_changeset_ids = cursor.fetchall()

            if not available_changeset_ids:
                # TODO change redirect URL
                return redirect('/')

            for ind, item in enumerate(available_changeset_ids):
                available_changeset_ids[ind] = str(item[0])

            changeset_id1 = self.kwargs.get('changeset_id1')
            if changeset_id1 not in available_changeset_ids:
                try:
                    changeset_id1 = available_changeset_ids[1]
                except IndexError:
                    changeset_id1 = available_changeset_ids[0]

            cursor.execute(
                'select * from core_utils.get_feature_by_uuid_for_changeset(%s, %s)',
                (str(feature_uuid), str(changeset_id1))
            )
            changeset1_values = json.loads(cursor.fetchone()[0])[0]

            changeset_id2 = self.kwargs.get('changeset_id2')
            if changeset_id2 not in available_changeset_ids:
                changeset_id2 = available_changeset_ids[0]

            cursor.execute(
                'select * from core_utils.get_feature_by_uuid_for_changeset(%s, %s)',
                (str(feature_uuid), str(changeset_id2))
            )
            changeset2_values = json.loads(cursor.fetchone()[0])[0]

            cursor.execute(
                'select label, key from public.attributes_attribute'
            )
            attr_labels_keys = cursor.fetchall()

        attributes_dict = {}
        for item in attr_labels_keys:
            attributes_dict[item[1]] = item[0]

        table = integrate_data(changeset1_values, changeset2_values, attributes_dict)

        different_labels = find_differences(table)

        changeset1_metadata = get_metadata(changeset1_values)
        changeset2_metadata = get_metadata(changeset2_values)
        metadata = {'changeset1': changeset1_metadata, 'changeset2': changeset2_metadata, 'feature_uuid': feature_uuid}

        return render(request, 'feature_diff/feature_diff_page.html', {
            'table': table, 'changeset_id1': changeset_id1, 'changeset_id2': changeset_id2,
            'different_labels': different_labels, 'metadata': metadata,
            'available_changeset_ids': available_changeset_ids, 'feature_uuid': feature_uuid
        })
