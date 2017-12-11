# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'movement'
__date__ = '5/11/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

import json

from django.contrib.contenttypes.models import ContentType
from django.contrib import messages
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist

from event_mapper.forms.movement import MovementUpdateForm, MovementViewForm
from event_mapper.models.country import Country
from event_mapper.models.province import Province
from event_mapper.models.movement import Movement


@login_required
def update_movement(request):
    """Update movement."""
    user = request.user
    if user.is_data_captor or user.is_staff or user.is_admin:
        if request.method == 'POST':
            form = MovementUpdateForm(request.POST, user=request.user)
            if form.is_valid():
                movement = form.update()
                if movement.boundary_type.model_class() == Country:
                    country_id = movement.boundary_id
                    response = get_country_information(country_id)
                else:
                    province_id = movement.boundary_id
                    province = Province.objects.get(pk=province_id)
                    response = get_province_information(province)

                success_message = (
                    'You have successfully update new movement for %s.' %
                    movement.boundary.name)
                response['success_message'] = success_message
                response['success'] = True
                return HttpResponse(json.dumps(
                    response,
                    ensure_ascii=False),
                    content_type='application/javascript')
            else:
                error_message = form.errors
                response = {'error_message': str(error_message), 'success': False}
                return HttpResponse(json.dumps(
                    response,
                    ensure_ascii=False),
                    content_type='application/javascript')
        else:
            form = MovementUpdateForm(user=request.user)
    else:
        form = MovementViewForm(user=request.user)

    return render_to_response(
        'event_mapper/movement/update_movement_page.html',
        {'form': form},
        context_instance=RequestContext(request)
    )


def get_country_information(country_id):
    country = Country.objects.get(pk=country_id)
    country_name = country.name
    provinces = Province.objects.filter(country=country).order_by('name')
    provinces = [(province.id, province.name) for province in provinces]
    polygon = country.polygon_geometry.geojson
    polygon_extent = country.polygon_geometry.extent
    country_type = ContentType.objects.get_for_model(Country)
    movement_query = Movement.objects.filter(
        boundary_type=country_type,
        boundary_id=country_id)
    if movement_query:
        movement = movement_query[0]
        risk_level_id = movement.risk_level
        movement_state_id = movement.movement_state
        notes = movement.notes
        notified_immediately = movement.notified_immediately
    else:
        risk_level_id = Movement.INSIGNIFICANT_CODE
        movement_state_id = Movement.NORMAL_CODE
        notes = ''
        notified_immediately = False

    risk_level_label = Movement.get_risk_level_label(risk_level_id)
    movement_state_label = Movement.get_movement_state_label(
        movement_state_id)

    response = {
        'country_id': country_id,
        'provinces': provinces,
        'country_name': country_name,
        'polygon': polygon,
        'risk_level_id': risk_level_id,
        'movement_state_id': movement_state_id,
        'notes': notes,
        'risk_level_label': risk_level_label,
        'movement_state_label': movement_state_label,
        'polygon_extent': polygon_extent,
        'notified_immediately': notified_immediately,
        'province_id': 0
    }

    return response


def get_province_information(province):
    province_id = province.pk
    province_name = province.name
    country_name = province.country.name
    country_id = province.country.id
    country_extent = province.country.polygon_geometry.extent
    polygon = province.polygon_geometry.geojson
    province_type = ContentType.objects.get_for_model(Province)
    movement_query = Movement.objects.filter(
        boundary_type=province_type,
        boundary_id=province_id)
    if movement_query:
        movement = movement_query[0]
        risk_level_id = movement.risk_level
        movement_state_id = movement.movement_state
        notes = movement.notes
        notified_immediately = movement.notified_immediately
    else:
        risk_level_id = Movement.INSIGNIFICANT_CODE
        movement_state_id = Movement.NORMAL_CODE
        notes = ''
        notified_immediately = False

    risk_level_label = Movement.get_risk_level_label(risk_level_id)
    movement_state_label = Movement.get_movement_state_label(
        movement_state_id)

    response = {
        'province_id': province_id,
        'province_name': province_name,
        'country_name': country_name,
        'country_id': country_id,
        'polygon': polygon,
        'risk_level_id': risk_level_id,
        'movement_state_id': movement_state_id,
        'notes': notes,
        'risk_level_label': risk_level_label,
        'movement_state_label': movement_state_label,
        'notified_immediately': notified_immediately,
        'polygon_extent': country_extent
    }

    return response


@login_required
def get_country(request):
    if request.method == 'POST':
        country_id = request.POST.get('country_id')
        response = get_country_information(country_id)
        return HttpResponse(json.dumps(
            response,
            ensure_ascii=False),
            content_type='application/javascript')
    else:
        return HttpResponse(
            json.dumps({'Nothing'}),
            content_type="application/json"
        )


@login_required
def get_province(request):
    if request.method == 'POST':
        province_id = request.POST.get('province_id')
        try:
            province = Province.objects.get(id=province_id)
        except ObjectDoesNotExist:
            return HttpResponse(
                json.dumps({'Nothing'}),
                content_type="application/json"
            )
        response = get_province_information(province)
        return HttpResponse(json.dumps(
            response,
            ensure_ascii=False),
            content_type='application/javascript')
    else:
        return HttpResponse(
            json.dumps({'Nothing'}),
            content_type="application/json"
        )
