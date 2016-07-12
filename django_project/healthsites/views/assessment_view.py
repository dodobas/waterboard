# coding=utf-8
__author__ = 'Irwan Fathurrahman <irwan@kartoza.com>'
__date__ = '01/06/16'
__license__ = "GPL"
__copyright__ = 'kartoza.com'

import json
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from healthsites.models.assessment import HealthsiteAssessment
from healthsites.models.healthsite import Healthsite
from healthsites.utils import create_event, update_event, clean_parameter, get_overall_assessments
from exceptions import ValueError


def update_assessment(request):
    messages = {}
    if request.method == "POST":
        #  check the authenticator
        if not request.user.is_authenticated() and not request.user.is_data_captor \
                and not request.user.is_staff and not request.user.is_superuser:
            messages = {'fail': ["just datacaptor can update assessment"]}
            result = json.dumps(messages)
            return HttpResponse(result, content_type='application/json')

        mandatory_attributes = ['method', 'name', 'latitude', 'longitude', 'overall_assessment']
        error_param_message = []
        for attributes in mandatory_attributes:
            if not attributes in request.POST or request.POST.get(attributes) == "":
                error_param_message.append(attributes)

        if len(error_param_message) > 0:
            messages = {'fail_params': error_param_message}
            messages['fail'] = ["some field in general need to be filled"]
            result = json.dumps(messages)
            return HttpResponse(result, content_type='application/json')

        messages['success'] = []
        messages['fail'] = []
        assessment = request.POST.get('overall_assessment')
        try:
            if (int(assessment) < 1 or int(assessment) > 5):
                messages = {'fail': ["overal assessment just from 1 to 5"]}
                result = json.dumps(messages)
                return HttpResponse(result, content_type='application/json')
        except ValueError:
            messages = {'fail': ["overal assessment should be integer"]}
            result = json.dumps(messages)
            return HttpResponse(result, content_type='application/json')

        # creating/update
        method = request.POST.get('method')
        if method == "add":
            output = create_event(request.user, clean_parameter(request.POST))
            if output:
                messages['success'].append("New assessment saved")
                messages['detail'] = output.get_dict()
            else:
                messages['fail'].append("something is wrong when creating")

        elif method == "update":
            output = update_event(request.user, clean_parameter(request.POST))
            if output:
                messages['success'].append("Assessment updated")
            else:
                messages['fail'].append("something is wrong when updating")

        result = json.dumps(messages, cls=DjangoJSONEncoder)
        return HttpResponse(result, content_type='application/json')


def download_report(request, year, month, day):
    from django.shortcuts import render_to_response
    from django.template import RequestContext
    from datetime import datetime
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
    date = datetime.strptime(year + " " + month + " " + day, '%Y %m %d')
    reports = []
    for assessment in assessments:
        reports.append(assessment.get_dict(True))
    return render_to_response(
        'report_file.html',
        {
            'date': date,
            'number': assessments.count(),
            'assessments': reports
        },
        context_instance=RequestContext(request)

    )


def overall_assessments(request):
    if request.method == "GET":
        assessment_id = request.GET['assessment_id']
        # find the healthsite
        try:
            assessment = HealthsiteAssessment.objects.get(id=assessment_id)
            assessments = get_overall_assessments(assessment.healthsite)
            result = []
            for assessment in assessments:
                result.append(
                    {'created_date': assessment.created_date, 'overall_assessment': assessment.overall_assessment});
            result = json.dumps(result, cls=DjangoJSONEncoder)
            return HttpResponse(result, content_type='application/json')
        except Healthsite.HealthsiteAssessment:
            pass
        return HttpResponse({}, content_type='application/json')
