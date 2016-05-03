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
from django.shortcuts import render_to_response, loader
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt

from django.contrib.gis.geos import Polygon
from django.db.models import Q
from django.utils import dateparse

from event_mapper.models.event import Event
from event_mapper.forms.event import EventCreationForm
from healthsites.models.healthsite import Healthsite

from dummy import dummy_data
import datetime


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
            events = Event.objects.filter(location__contained=geom)
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
            events = Event.objects.filter(Q(location__contained=geom1) | Q(
                location__contained=geom2))

        # events = events.filter(
        #     date_time__gt=start_time, date_time__lt=end_time)

        for event in events:
            note = event.notes
            note = json.dumps(note)
            event.clean_notes = note

            source = event.source
            source = json.dumps(source)
            event.clean_source = source

        context = {
            'events': events
        }

        events_json = loader.render_to_string(
            'event_mapper/event/events.json',
            context_instance=RequestContext(request, context))

        out_dummy_data = {
            "events": {
                "type": "FeatureCollection",
                "features": []
            }
        }
        for data in dummy_data['events']['features']:
            geom = data['geometry']['coordinates']
            if geom[0] <= bbox_dict['ne_lng'] and geom[0] >= bbox_dict['sw_lng'] and geom[1] <= bbox_dict[
                'ne_lat'] and geom[1] >= bbox_dict['sw_lat']:
                out_dummy_data['events']['features'].append(data)

        events_json = json.dumps(out_dummy_data)
        return HttpResponse(events_json, content_type='application/json')
