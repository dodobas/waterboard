# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.db import connection
from django.http import HttpResponse
from django.views import View


class AttributeOptionsList(View):
    """
    Filter attribute options by attribute key and options key

    http://127.0.0.1:8008/attributes/filter/options?attributeOptionsSearchString=selam&attributeKey=tabiya
    """
    def get(self, request):

        search_name = request.GET.get('attributeOptionsSearchString', None)
        attribute_key = request.GET.get('attributeKey', None)

        with connection.cursor() as cursor:
            cursor.execute(
                'select * from core_utils.filter_attribute_options(%s, %s)',
                (attribute_key, search_name)
            )
            data = cursor.fetchone()

        # TODO query call here
        # return JsonResponse(json.loads(result[0]), status=200, safe=False)
        return HttpResponse(content=data, content_type='application/json')
