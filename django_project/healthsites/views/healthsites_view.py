__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '10/04/16'

import json
from django.http import Http404, HttpResponse
from django.views.generic.edit import FormView

from healthsites.forms.assessment_form import AssessmentForm
from healthsites.utils import healthsites_clustering
from healthsites.models.healthsite import Healthsite


class HealthsitesView(FormView):
    template_name = 'healthsites.html'
    form_class = AssessmentForm
    success_url = '/healthsites'


def get_cluster(request):
    if request.method == "GET":
        if not (all(param in request.GET for param in ['bbox', 'zoom', 'iconsize'])):
            raise Http404
        result = healthsites_clustering(request.GET['bbox'], int(request.GET['zoom']),
                                        map(int, request.GET.get('iconsize').split(',')))
        return HttpResponse(result, content_type='application/json')


def search_healthsites_name(request):
    if request.method == 'GET':
        query = request.GET.get('q')
        names_start_with = Healthsite.objects.filter(
            name__istartswith=query).order_by('name')
        names_contains_with = Healthsite.objects.filter(
            name__icontains=query).exclude(name__istartswith=query).order_by('name')

        result = []
        # start with with query
        for name_start_with in names_start_with:
            result.append(name_start_with.name)

        # contains with query
        for name_contains_with in names_contains_with:
            result.append(name_contains_with.name)
        result = json.dumps(result)
        return HttpResponse(result, content_type='application/json')


def search_healthsite_by_name(request):
    if request.method == 'GET':
        query = request.GET.get('q')
        healthsites = Healthsite.objects.filter(name=query)

        geom = []
        if len(healthsites) > 0:
            geom = [healthsites[0].point_geometry.y, healthsites[0].point_geometry.x]
        result = json.dumps({'query': query, 'geom': geom})
        return HttpResponse(result, content_type='application/json')
