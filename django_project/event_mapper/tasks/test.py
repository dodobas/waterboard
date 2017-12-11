# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'test'
__date__ = '9/11/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

from random import randint


def test_generate_event_text():
    from event_mapper.models.event import Event
    events = Event.objects.all()
    event = events[randint(0, len(events))]
    return event.text_report()


def test_generate_event_html():
    from event_mapper.models.event import Event
    events = Event.objects.all()
    event = events[randint(0, len(events))]
    return event.html_report()


def test_generate_movement_html():
    from event_mapper.models.movement import Movement
    movements = Movement.objects.all()
    movement = movements[randint(0, len(movements))]
    return movement.html_report()
