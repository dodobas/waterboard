# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json

from django.db import connection
from django.shortcuts import render
from django.views import View

from common.mixins import AdminRequiredMixin


def integrate_data(changeset1, changeset2, attributes_dict):
    returning_dict = {}

    for key, value in changeset1.items():
        if key in attributes_dict:
            returning_dict[attributes_dict[key]] = {
                'changeset1_value': '-' if value is None else value,
                'changeset2_value': '-' if changeset2[key] is None else changeset2[key]
            }

    return returning_dict


def find_differences(table):
    different_labels = []

    for label, values in table.items():
        if values['changeset1_value'] != values['changeset2_value']:
            different_labels.append(label)

    return different_labels


# http://127.0.0.1:8000/difference_viewer?feature_uuid=13b4f8b7-857d-48ac-ace2-b791b3094f6f&changeset1=1&changeset2=3
class DifferenceViewer(AdminRequiredMixin, View):

    def get(self, request):
        feature_uuid = request.GET.get('feature_uuid')
        changeset1 = request.GET.get('changeset1')
        changeset2 = request.GET.get('changeset2')

        with connection.cursor() as cursor:
            cursor.execute(
                'select * from core_utils.get_feature_by_uuid_for_changeset(%s, %s)',
                (str(feature_uuid), str(changeset1))
            )
            changeset1_values = json.loads(cursor.fetchone()[0])[0]

            cursor.execute(
                'select * from core_utils.get_feature_by_uuid_for_changeset(%s, %s)',
                (str(feature_uuid), str(changeset2))
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

        return render(request, 'feature_diff/feature_diff_page.html', {
            'table': table, 'changeset_id1': changeset1, 'changeset_id2': changeset2,
            'different_labels': different_labels
        })
