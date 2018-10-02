# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.db import connection
from django.http import HttpResponse


def wfs_exception(version, text, locator, exception_code):
    with connection.cursor() as cursor:
        cursor.execute(
            'SELECT core_utils.wfs_exception_xml(%s, %s, %s, %s);',
            (version, text, locator, exception_code)
        )

        response = cursor.fetchall()[0]

    return HttpResponse(response, content_type='text/xml')
