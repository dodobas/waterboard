# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import os
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response


@login_required
def healthsites_reports(request):
    return render_to_response(
        'healthsites-reports.html',
        {
            'sample': ''
        },
        context_instance=RequestContext(request)

    )
