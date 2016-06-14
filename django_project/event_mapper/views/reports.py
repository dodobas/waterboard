# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'reports'
__date__ = '8/4/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

import os
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, render

from event_mapper.models.daily_report import DailyReport
from event_mapper.models.event import Event
from healthsites.models.assessment import HealthsiteAssessment


@login_required
def reports(request):
    """View for request."""
    daily_reports = HealthsiteAssessment.objects.extra(select={'day': 'date( created_date )'}).values('day').annotate(
        assessment_number=Count('created_date')).order_by('-day')
    print daily_reports
    return render_to_response(
        'event_mapper/reports/reports_page.html',
        {'daily_reports': daily_reports},
        context_instance=RequestContext(request)

    )


def download_report(request, report_id):
    """The view to download users data as CSV.

    :param request: A django request object.
    :type request: request

    :return: A PDF File
    :type: HttpResponse
    """
    report = DailyReport.objects.get(id=report_id)
    fsock = open(report.file_path, 'r')
    response = HttpResponse(fsock, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="%s"' % (
        os.path.basename(report.file_path)
    )
    return response

