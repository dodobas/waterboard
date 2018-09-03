# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json

from django.db import connection
from django.shortcuts import render
from django.views import View

from common.mixins import AdminRequiredMixin

from .utils import find_differences, get_metadata, integrate_data


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

        changeset1_metadata = get_metadata(changeset1_values)
        changeset2_metadata = get_metadata(changeset2_values)
        metadata = {'changeset1': changeset1_metadata, 'changeset2': changeset2_metadata}

        return render(request, 'feature_diff/feature_diff_page.html', {
            'table': table, 'changeset_id1': changeset1, 'changeset_id2': changeset2,
            'different_labels': different_labels, 'metadata': metadata
        })
