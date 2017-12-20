# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from healthsites.models import Healthsite


def index(request):
    """Landing page."""
    return render(request, 'event_mapper/index.html')


@login_required
def event_dashboard(request):
    """Show dashboard for the events."""
    if request.method == 'GET':
        return render(
            request,
            'event/event_dashboard_page.html',
            {'healthsites_num': Healthsite.objects.filter(is_healthsites_io=True).count()}
        )
    elif request.method == 'POST':
        # POST
        pass
