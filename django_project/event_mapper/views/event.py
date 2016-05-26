# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'event'
__date__ = '5/4/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

import json
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt

from django.contrib.gis.geos import Polygon
from django.db.models import Q
from event_mapper.forms.event import EventCreationForm
from healthsites.models.healthsite import Healthsite
from healthsites.models.assessment import HealthsiteAssessment
from django.core.serializers.json import DjangoJSONEncoder


@login_required
def add_event(request):
    """Add event views."""
    if request.method == 'POST':
        form = EventCreationForm(request.POST, user=request.user)
        if form.is_valid():
            event = form.save()
            success_message = 'You have successfully added new event.'
            messages.success(request, success_message)
            return HttpResponseRedirect(reverse('event_mapper:add_event'))
        else:
            error_message = 'Failed to add event. See error below.'
            messages.error(request, error_message)
    else:
        form = EventCreationForm(user=request.user)

    return render_to_response(
        'event_mapper/event/add_event_page.html',
        {'form': form},
        context_instance=RequestContext(request)
    )


@login_required
def event_dashboard(request):
    """Show dashboard for the events."""
    if request.method == 'GET':
        return render_to_response(
            'event_mapper/event/event_dashboard_page.html',
            {"healthsites_num": Healthsite.objects.count()},
            context_instance=RequestContext(request)
        )
    elif request.method == 'POST':
        # POST
        pass


@csrf_exempt
def get_events(request):
    """Get events in json format."""
    if request.method == 'POST':
        bbox_dict = json.loads(request.POST.get('bbox'))
        bbox = [
            bbox_dict['sw_lng'], bbox_dict['sw_lat'],
            bbox_dict['ne_lng'], bbox_dict['ne_lat']
        ]
        if bbox[0] < bbox[2]:
            geom = Polygon.from_bbox(bbox)
            events = HealthsiteAssessment.objects.filter(healthsite__point_geometry__contained=geom).filter(
                current=True)
        else:
            # Separate into two bbox
            bbox1 = [
                bbox_dict['sw_lng'], bbox_dict['sw_lat'],
                180, bbox_dict['ne_lat']
            ]
            bbox2 = [
                -180, bbox_dict['sw_lat'],
                bbox_dict['ne_lng'], bbox_dict['ne_lat']
            ]
            geom1 = Polygon.from_bbox(bbox1)
            geom2 = Polygon.from_bbox(bbox2)
            events = HealthsiteAssessment.objects.filter(Q(healthsite__point_geometry__contained=geom1) | Q(
                healthsite__point_geometry__contained=geom2)).filter(current=True)

        context = []
        try:
            for event in events:
                context.append(event.get_dict(True))
        except Exception as e:
            print e
        try:
            events_json = json.dumps(context, cls=DjangoJSONEncoder)
            return HttpResponse(events_json, content_type='application/json')
        except Exception as e:
            print e
