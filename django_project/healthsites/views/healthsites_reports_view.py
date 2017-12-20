# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def healthsites_reports(request):
    return render(
        request,
        'healthsites-reports.html',
        {
            'sample': ''
        }
    )
