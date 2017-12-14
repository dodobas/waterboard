# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json

import googlemaps

from django.conf import settings
from django.http import Http404, HttpResponse
from django.views.generic.edit import FormView

from ..forms.assessment_form import AssessmentForm
from ..models.assessment import HealthsiteAssessment
from ..models.healthsite import Healthsite
from ..utils import healthsites_clustering, parse_bbox


def get_cluster(request):
    if request.method == 'GET':
        if not (all(param in request.GET for param in ['bbox', 'zoom', 'iconsize'])):
            raise Http404
        result = healthsites_clustering(request.GET['bbox'], int(request.GET['zoom']),
                                        map(int, request.GET.get('iconsize').split(',')))
        return HttpResponse(result, content_type='application/json')


class HealthsitesView(FormView):
    template_name = 'healthsites.html'
    form_class = AssessmentForm
    success_url = '/healthsites'
    success_message = 'new event was added successfully'

    def form_valid(self, form):
        form.save_form()
        return super(HealthsitesView, self).form_valid(form)

    def get_form_kwargs(self):
        kwargs = super(HealthsitesView, self).get_form_kwargs()
        return kwargs

    def get_success_message(self, cleaned_data):
        return self.success_message


def search_healthsites_name(request):
    if request.method == 'GET':
        query = request.GET.get('q')

        with_place = False
        if ',' in query:
            place = query.split(',', 1)[1].strip()
            query = query.split(',', 1)[0].strip()
            if len(place) > 2:
                with_place = True
                google_maps_api_key = settings.get('GOOGLE_MAPS_API_KEY')
                gmaps = googlemaps.Client(key=google_maps_api_key)
                geocode_result = gmaps.geocode(place)[0]
                viewport = geocode_result['geometry']['viewport']
                polygon = parse_bbox('%s,%s,%s,%s' % (
                    viewport['southwest']['lng'], viewport['southwest']['lat'], viewport['northeast']['lng'],
                    viewport['northeast']['lat']))
                healthsites = Healthsite.objects.filter(point_geometry__within=polygon)

        names_start_with = Healthsite.objects.filter(is_healthsites_io=True).filter(
            name__istartswith=query).order_by('name')
        names_contains_with = Healthsite.objects.filter(is_healthsites_io=True).filter(
            name__icontains=query).exclude(name__istartswith=query).order_by('name')
        if with_place:
            names_start_with = names_start_with.filter(id__in=healthsites)
            names_contains_with = names_contains_with.filter(id__in=healthsites)

        result = []
        # start with with query
        for name_start_with in names_start_with:
            result.append(name_start_with.name)

        # contains with query
        for name_contains_with in names_contains_with:
            result.append(name_contains_with.name)
        result = json.dumps(result)
        return HttpResponse(result, content_type='application/json')


def search_assessment_name(request):
    if request.method == 'GET':
        query = request.GET.get('q')

        with_place = False
        if ',' in query:
            place = query.split(',', 1)[1].strip()
            query = query.split(',', 1)[0].strip()
            if len(place) > 2:
                with_place = True
                google_maps_api_key = settings.get('GOOGLE_MAPS_API_KEY')
                gmaps = googlemaps.Client(key=google_maps_api_key)
                geocode_result = gmaps.geocode(place)[0]
                viewport = geocode_result['geometry']['viewport']
                polygon = parse_bbox('%s,%s,%s,%s' % (
                    viewport['southwest']['lng'], viewport['southwest']['lat'], viewport['northeast']['lng'],
                    viewport['northeast']['lat']))
                healthsites = Healthsite.objects.filter(point_geometry__within=polygon)

        names_start_with = HealthsiteAssessment.objects.filter(current=True).filter(
            name__istartswith=query).order_by('name')
        names_contains_with = HealthsiteAssessment.objects.filter(current=True).filter(
            name__icontains=query).exclude(name__istartswith=query).order_by('name')
        if with_place:
            names_start_with = names_start_with.filter(id__in=healthsites)
            names_contains_with = names_contains_with.filter(id__in=healthsites)

        result = []
        # start with with query
        for name_start_with in names_start_with:
            result.append(name_start_with.name)

        # contains with query
        for name_contains_with in names_contains_with:
            result.append(name_contains_with.name)
        result = json.dumps(result)
        return HttpResponse(result, content_type='application/json')


def search_name(request):
    if request.method == 'GET':
        option = request.GET.get('option')
        query = request.GET.get('q')
        if option == 'place':
            google_maps_api_key = settings.get('GOOGLE_MAPS_API_KEY')
            gmaps = googlemaps.Client(key=google_maps_api_key)
            geocode_result = gmaps.geocode(query)[0]
            viewport = geocode_result['geometry']['viewport']
            result = json.dumps({'query': query, 'viewport': viewport})
            return HttpResponse(result, content_type='application/json')
        elif option == 'assessment':
            assessment = HealthsiteAssessment.objects.filter(name=query)
            geom = []
            if len(assessment) > 0:
                geom = [assessment[0].point_geometry.y, assessment[0].point_geometry.x]
            result = json.dumps({'query': query, 'geom': geom})
            return HttpResponse(result, content_type='application/json')
        else:
            healthsites = Healthsite.objects.filter(name=query).filter(is_healthsites_io=True)
            geom = []
            if len(healthsites) > 0:
                geom = [healthsites[0].point_geometry.y, healthsites[0].point_geometry.x]
            result = json.dumps({'query': query, 'geom': geom})
            return HttpResponse(result, content_type='application/json')
