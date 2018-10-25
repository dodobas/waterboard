# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json
from string import capwords

from django.db import connection
from django.http import Http404
from django.shortcuts import render
from django.views import View

from common.mixins import LoginRequiredMixin

from .utils import find_differences, get_metadata, integrate_data


# http://127.0.0.1:8000/difference_viewer/13b4f8b7-857d-48ac-ace2-b791b3094f6f/1/3
class DifferenceViewer(LoginRequiredMixin, View):

    def get(self, request, feature_uuid, **kwargs):

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT changeset_id, changeset_type
                FROM features.history_data
                    INNER JOIN features.changeset ON features.history_data.changeset_id = features.changeset.id
                WHERE feature_uuid = %s
                ORDER BY changeset_id DESC;
                """, (
                    str(feature_uuid),
                )
            )
            available_changesets = cursor.fetchall()

            if not available_changesets:
                raise Http404

            available_changeset_ids = []
            changeset_types = []
            for ind, item in enumerate(available_changesets):
                available_changeset_ids += [str(item[0])]
                changeset_types += [capwords(item[1])]

            changeset_id1 = self.kwargs.get('changeset_id1')
            if changeset_id1 not in available_changeset_ids:
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
                """
                SELECT ag.key, ag.label, ag.position, aa.label, aa.key, aa.result_type, aa.position
                FROM attributes_attribute aa JOIN attributes_attributegroup ag ON aa.attribute_group_id = ag.id
                WHERE is_active = True
                ORDER BY ag.position, aa.position
                """
            )
            attr_labels_keys = cursor.fetchall()

        attributes = []
        for item in attr_labels_keys:
            attributes.append({'group_label': item[1], 'label': item[3], 'key': item[4]})

        table = integrate_data(changeset1_values, changeset2_values, attributes)

        different_labels = find_differences(table)

        changeset1_metadata = get_metadata(changeset1_values, changeset_id1, available_changeset_ids, changeset_types)
        changeset2_metadata = get_metadata(changeset2_values, changeset_id2, available_changeset_ids, changeset_types)
        metadata = {'changeset1': changeset1_metadata, 'changeset2': changeset2_metadata, 'feature_uuid': feature_uuid}

        return render(request, 'feature_diff/feature_diff_page.html', {
            'table': table, 'changeset_id1': changeset_id1, 'changeset_id2': changeset_id2,
            'different_labels': different_labels, 'metadata': metadata,
            'available_changeset_ids': available_changeset_ids, 'feature_uuid': feature_uuid,

        })
