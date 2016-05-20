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
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.template import RequestContext

from event_mapper.models.daily_report import DailyReport
from event_mapper.models.event import Event


@login_required
def reports(request):
    """View for request."""
    daily_reports = DailyReport.objects.all().order_by('-date_time')
    return render_to_response(
        'event_mapper/reports/reports_page.html',
        {
            'daily_reports': daily_reports
        },
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
    from .dummy import dummy_data
    """The view to download users data as CSV.

    :param request: A django request object.
    :type request: request

    :return: A CSV File
    :type: HttpResponse
    """
    try:
        event = Event.objects.get(id=assessment_id)
    except Event.DoesNotExist:
        pass
    # get dummy data now
    event = {}
    for feature in dummy_data['events']['features']:
        if feature['properties']['id'] == assessment_id:
            event = feature
            break
    # create the csv writer object# Create the HttpResponse object with the appropriate CSV header.
    response = HttpResponse(content_type='application/csv')
    response['Content-Disposition'] = 'attachment; filename="' + assessment_id + '.csv"'
    # convert to csv
    list_key = ["latitude", "longitude"]
    list_key = list_key + event['properties'].keys()
    print list_key
    value = [event['geometry']['coordinates'][0], event['geometry']['coordinates'][1]]
    value = value + [event['properties'][value] for value in event['properties'].keys()]
    print value
    #  csv write
    writer = csv.writer(response)
    writer.writerow(list_key)
    writer.writerow(value)
    return response
