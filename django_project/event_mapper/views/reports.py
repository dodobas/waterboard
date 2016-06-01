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
from django.shortcuts import render_to_response

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


def download_assesment_report(request, assessment_id):
    import csv
    import json
    """The view to download users data as CSV.

    :param request: A django request object.
    :type request: request

    :return: A CSV File
    :type: HttpResponse
    """
    keys = []
    values = []
    try:
        event = HealthsiteAssessment.objects.get(id=assessment_id)
        dict = event.get_dict(True)
        for key in dict.keys():
            if key != 'assessment' and key != 'healthsite':
                keys.append(key)
                values.append(dict[key])
        for key in dict['healthsite'].keys():
            if key == "geometry":
                keys.append("latitude")
                values.append(dict['healthsite'][key][0])
                keys.append("longitude")
                values.append(dict['healthsite'][key][1])
            else:
                keys.append(key)
                values.append(dict['healthsite'][key])
        for key in dict['assessment'].keys():
            keys.append(key)
            values.append(dict['assessment'][key])
    except Event.DoesNotExist:
        pass

    # create the csv writer object# Create the HttpResponse object with the appropriate CSV header.
    response = HttpResponse(content_type='application/csv')
    response['Content-Disposition'] = 'attachment; filename="' + assessment_id + '.csv"'
    # convert to csv
    writer = csv.writer(response)
    writer.writerow([s.encode('utf8') if type(s) is unicode else s for s in keys])
    writer.writerow([s.encode('utf8') if type(s) is unicode else s for s in values])
    return response
