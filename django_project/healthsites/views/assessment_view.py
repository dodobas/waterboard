# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json
from datetime import datetime

from django.contrib.gis.geos import Polygon
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Q
from django.db import connection
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from ..models.assessment import HealthsiteAssessment
from ..utils import clean_parameter, create_event, get_overall_assessments, update_event


def update_assessment(request):
    messages = {}
    if request.method == 'POST':
        #  check the authenticator
        if not request.user.is_authenticated() and not request.user.is_staff and not request.user.is_superuser:
            messages = {'fail': ['just datacaptor can update assessment']}
            result = json.dumps(messages)
            return HttpResponse(result, content_type='application/json')

        mandatory_attributes = ['method', 'name', 'latitude', 'longitude', 'overall_assessment']
        error_param_message = []
        for attributes in mandatory_attributes:
            if attributes not in request.POST or request.POST.get(attributes) == '':
                error_param_message.append(attributes)

        if len(error_param_message) > 0:
            messages = {'fail_params': error_param_message}
            messages['fail'] = ['some field in general need to be filled']
            result = json.dumps(messages)
            return HttpResponse(result, content_type='application/json')

        messages['success'] = []
        messages['fail'] = []
        assessment = request.POST.get('overall_assessment')
        try:
            if (int(assessment) < 1 or int(assessment) > 5):
                messages = {'fail': ['overal assessment just from 1 to 5']}
                result = json.dumps(messages)
                return HttpResponse(result, content_type='application/json')
        except ValueError:
            messages = {'fail': ['overal assessment should be integer']}
            result = json.dumps(messages)
            return HttpResponse(result, content_type='application/json')

        # creating/update
        method = request.POST.get('method')
        if method == 'add':
            output = create_event(request.user, clean_parameter(request.POST))
            if output:
                messages['success'].append('New assessment saved')
                messages['detail'] = output.get_dict()
            else:
                messages['fail'].append('something is wrong when creating')

        elif method == 'update':
            output = update_event(request.user, clean_parameter(request.POST))
            if output:
                messages['success'].append('Assessment updated')
            else:
                messages['fail'].append('something is wrong when updating')

        result = json.dumps(messages, cls=DjangoJSONEncoder)
        return HttpResponse(result, content_type='application/json')


def download_assesment_report_pdf(request, year, month, day):
    """The view to download users data as PDF.

    :param request: A django request object.
    :type request: request

    :return: A PDF File
    :type: HttpResponse
    """
    # fsock = open(report.file_path, 'r')
    # response = HttpResponse(fsock, content_type='application/pdf')
    # response['Content-Disposition'] = 'attachment; filename="%s"' % (
    #     os.path.basename(report.file_path)
    # )
    assessments = HealthsiteAssessment.objects.filter(
        created_date__year=year, created_date__month=month, created_date__day=day).order_by('-created_date')
    date = datetime.strptime(year + ' ' + month + ' ' + day, '%Y %m %d')
    reports = []
    for assessment in assessments:
        reports.append(assessment.get_dict())
    return render(
        request,
        'report_file.html',
        {
            'date': date,
            'number': assessments.count(),
            'assessments': reports
        }
    )


def overall_assessments(request):
    if request.method == 'GET':
        assessment_id = request.GET['assessment_id']
        # find the healthsite
        try:
            assessment = HealthsiteAssessment.objects.get(id=assessment_id)
            assessments = get_overall_assessments(assessment.healthsite)
            result = []
            for assessment in assessments:
                result.append(
                    {'created_date': assessment.created_date, 'overall_assessment': assessment.overall_assessment})
            result = json.dumps(result, cls=DjangoJSONEncoder)
            return HttpResponse(result, content_type='application/json')
        except HealthsiteAssessment.DoesNotExist:
            pass
        return HttpResponse({}, content_type='application/json')


@csrf_exempt
def get_events(request):
    """Get events in json format."""
    if request.method == 'POST':
        bbox_dict = json.loads(request.POST.get('bbox'))

        with connection.cursor() as cur:
            cur.execute(
                'select data from {schema_name}.get_events(%s, %s, %s, %s) as data;'.format(
                    schema_name=settings.PG_UTILS_SCHEMA
                ),
                (bbox_dict['sw_lng'], bbox_dict['sw_lat'], bbox_dict['ne_lng'], bbox_dict['ne_lat'])
            )

            try:
                data = cur.fetchone()[0]

                return HttpResponse(data, content_type='application/json')
            except Exception as e:
                print(e)
