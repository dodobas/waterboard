# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json

from django.db import connection
from django.shortcuts import render
from django.views import View

from common.mixins import AdminRequiredMixin


def jsondiff(feature1, feature2):
    different_keys = []

    for key, value in feature1.items():
        if feature2[key] != value:
            different_keys.append(key)

    return different_keys


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
            feature1 = json.loads(cursor.fetchone()[0])[0]

            cursor.execute(
                'select * from core_utils.get_feature_by_uuid_for_changeset(%s, %s)',
                (str(feature_uuid), str(changeset2))
            )
            feature2 = json.loads(cursor.fetchone()[0])[0]

            different_keys = jsondiff(feature1, feature2)

        return render(request, 'feature_diff/feature_diff_page.html', {
            'changeset1': feature1, 'changeset2': feature2, 'difference': different_keys
        })
