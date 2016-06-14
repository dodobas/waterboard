# coding=utf-8
__author__ = 'Irwan Fathurrahman <irwan@kartoza.com>'
__date__ = '01/06/16'
__license__ = "GPL"
__copyright__ = 'kartoza.com'

import json
import uuid
from django.contrib.gis.geos import Point
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from healthsites.models.assessment import HealthsiteAssessment
from healthsites.models.healthsite import Healthsite
from healthsites.utils import create_event, update_event, clean_parameter, get_overall_assessments


def update_assessment(request):
    try:
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
                result = json.dumps(messages)
                return HttpResponse(result, content_type='application/json')

            #
            messages['success'] = []
            messages['fail'] = []
            name = request.POST.get('name')
            latitude = request.POST.get('latitude')
            longitude = request.POST.get('longitude')
            geom = Point(
                float(latitude), float(longitude)
            )
            # find the healthsite
            try:
                healthsite = Healthsite.objects.get(point_geometry=geom)
                healthsite.name = name
                healthsite.point_geometry = geom
                healthsite.save()
            except Healthsite.DoesNotExist:
                # generate new uuid
                tmp_uuid = uuid.uuid4().hex
                healthsite = Healthsite(name=name, point_geometry=geom, uuid=tmp_uuid, version=1)
                healthsite.save()

            method = request.POST.get('method')
            if method == "add":
                # regenerate_cache.delay()
                output = create_event(healthsite, request.user, clean_parameter(request.POST))
                if output:
                    messages['success'].append("New assessment saved")
                    messages['detail'] = output.get_dict(True)
                else:
                    messages['fail'].append("something is wrong when creating")

            elif method == "update":
                # regenerate_cache.delay()
                output = update_event(healthsite, request.user, clean_parameter(request.POST))
                if output:
                    messages['success'].append("Assessment updated")
                else:
                    messages['fail'].append("something is wrong when updating")

            result = json.dumps(messages, cls=DjangoJSONEncoder)
            return HttpResponse(result, content_type='application/json')
    except Exception as e:
        print e


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
        latitude = request.GET['longitude']
        longitude = request.GET['latitude']
        geom = Point(
            float(latitude), float(longitude)
        )
        # find the healthsite
        try:
            healthsite = Healthsite.objects.get(point_geometry=geom)
            assessments = get_overall_assessments(healthsite)
            result = []
            for assessment in assessments:
                result.append(
                    {'created_date': assessment.created_date, 'overall_assessment': assessment.overall_assessment});
            result = json.dumps(result, cls=DjangoJSONEncoder)
            return HttpResponse(result, content_type='application/json')
        except Healthsite.DoesNotExist:
            pass
        return HttpResponse({}, content_type='application/json')
