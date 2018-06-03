# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.db.models import Q
from django.http import JsonResponse
from django.views import View


class AttributeOptionsList(View):
    def get(self, request):

        search_name = request.GET.get('attributeOptionsSearchString', None)
        search_query = Q()

        if search_name:
            search_query = Q(name__contains=search_name)

        # TODO query call here
        return JsonResponse([], status=200, safe=False)
