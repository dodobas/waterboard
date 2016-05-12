__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '10/04/16'

import json
import uuid
from django.contrib.gis.geos import Point
from django.http import Http404, HttpResponse
from django.views.generic.edit import FormView

from healthsites.forms.assessment_form import AssessmentForm
from healthsites.utils import healthsites_clustering
from healthsites.models.healthsite import Healthsite


class HealthsitesView(FormView):
    template_name = 'healthsites.html'
    form_class = AssessmentForm
    success_url = '/healthsites'
    success_message = "new event was added successfully"

    def form_valid(self, form):
        form.save_form()
        return super(HealthsitesView, self).form_valid(form)

    def get_form_kwargs(self):
        kwargs = super(HealthsitesView, self).get_form_kwargs()
        return kwargs

    def get_success_message(self, cleaned_data):
        print cleaned_data
        return self.success_message


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


def update_assessment(request):
    if request.method == "POST":
        print request.POST
        if not (all(param in request.POST for param in ['method', 'name', 'latitude', 'longitude'])):
            result = json.dumps({'success': False, 'message': 'required parameters are not provided'})
            return HttpResponse(result, content_type='application/json')

        messages = []
        name = request.POST.get('name')
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')
        geom = Point(
            float(latitude), float(longitude)
        )
        # find the healthsite
        try:
            healthsite = Healthsite.objects.get(name=name, point_geometry=geom)
        except Healthsite.DoesNotExist:
            # generate new uuid
            tmp_uuid = uuid.uuid4().hex
            healthsite = Healthsite(name=name, point_geometry=geom, uuid=tmp_uuid, version=1)
            healthsite.save()
            messages.append("new healthsite is saved")

        method = request.POST.get('method')
        if method == "add":
            # regenerate_cache.delay()
            output = create_event(healthsite)
            if output:
                messages.append("new assesment is saved")
        elif method == "update":
            # regenerate_cache.delay()
            output = update_event(healthsite)
            if output:
                messages.append("the assesment is updated")

        result = json.dumps({'success': True, 'messages': messages})
        return HttpResponse(result, content_type='application/json')


def create_event(healthsite):
    # make new event
    return True


def update_event(healthsite):
    # update existing event
    return True
