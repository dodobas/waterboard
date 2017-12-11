# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'event'
__date__ = '5/4/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

from django.forms import models
from django import forms
from django.utils.safestring import mark_safe
from django.contrib.gis.geos import Point

from event_mapper.utilities.commons import get_verbose_name, get_help_text
from event_mapper.models.event import Event
from event_mapper.models.event_type import EventType
from event_mapper.models.perpetrator import Perpetrator
from event_mapper.models.victim import Victim


class HorizontalRadioRenderer(forms.RadioSelect.renderer):
    def render(self):
        return mark_safe(u'\n'.join([u'%s\n' % w for w in self]))


class EventCreationForm(models.ModelForm):
    """A form for creating an event."""
    class Meta:
        model = Event
        fields = (
            # see issue #29
            'date_time',  # required
            'longitude', 'latitude', 'place_name',  # required
            'type',  # required
            'category',  # required
            'perpetrator',
            'victim',
            'killed',
            'injured',
            'detained',
            'notified_immediately',
            'source',
            'notes'
        )

    longitude = forms.FloatField(
        label='Longitude',
        widget=forms.NumberInput(
            attrs={'class': 'form-control'}),
    )

    latitude = forms.FloatField(
        label='Latitude',
        widget=forms.NumberInput(
            attrs={'class': 'form-control'}),
    )

    category = forms.ChoiceField(
        label='',
        widget=forms.RadioSelect(
            renderer=HorizontalRadioRenderer,
            attrs={'class': 'form-control'}),
        choices=Event.CATEGORY_CHOICES,
        initial=Event.INCIDENT_CODE,
    )

    place_name = forms.CharField(
        label=get_verbose_name(Event, 'place_name'),
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Type your place or select on the map.'})
    )

    date_time = forms.DateTimeField(
        label=get_verbose_name(Event, 'date_time'),
        help_text=get_help_text(Event, 'date_time'),
        widget=forms.DateTimeInput(
            attrs={'class': 'form-control datetimepicker'})
    )

    type = forms.ModelChoiceField(
        label=get_verbose_name(Event, 'type'),
        required=True,
        queryset=EventType.objects.order_by(),
        widget=forms.Select(
            attrs={'class': 'form-control'})
    )

    perpetrator = forms.ModelChoiceField(
        label=get_verbose_name(Event, 'perpetrator'),
        help_text=get_help_text(Event, 'perpetrator'),
        required=False,
        queryset=Perpetrator.objects.order_by(),
        widget=forms.Select(
            attrs={'class': 'form-control'})
    )

    victim = forms.ModelChoiceField(
        label=get_verbose_name(Event, 'victim'),
        help_text=get_help_text(Event, 'victim'),
        required=False,
        queryset=Victim.objects.order_by(),
        widget=forms.Select(
            attrs={'class': 'form-control'})
    )

    killed = forms.IntegerField(
        label=get_verbose_name(Event, 'killed'),
        widget=forms.NumberInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'The number of killed people.'}),
        required=False
    )

    injured = forms.IntegerField(
        label=get_verbose_name(Event, 'injured'),
        widget=forms.NumberInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'The number of injured people.'}),
        required=False
    )

    detained = forms.IntegerField(
        label=get_verbose_name(Event, 'detained'),
        widget=forms.NumberInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'The number of detained people.'}),
        required=False
    )

    notified_immediately = forms.BooleanField(
        label=get_verbose_name(Event, 'notified_immediately'),
        help_text=get_help_text(Event, 'notified_immediately'),
        widget=forms.CheckboxInput(
            attrs={'class': ''}),
        required=False
    )

    source = forms.CharField(
        label=get_verbose_name(Event, 'source'),
        widget=forms.Textarea(
            attrs={'class': 'form-control',
                   'placeholder': get_help_text(Event, 'source')}),
        required=False,
    )

    notes = forms.CharField(
        label=get_verbose_name(Event, 'notes'),
        widget=forms.Textarea(
            attrs={'class': 'form-control',
                   'placeholder': get_help_text(Event, 'notes')}),
        required=False,
    )

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super(EventCreationForm, self).__init__(*args, **kwargs)

    def save(self, commit=True):
        data = self.cleaned_data
        event = super(EventCreationForm, self).save(commit=False)
        event.notification_sent = False
        event.reported_by = self.user
        event.location = Point(data['longitude'], data['latitude'])
        if event.category == event.ADVISORY_CODE:
            event.killed = 0
            event.injured = 0
            event.detained = 0
        if not event.killed:
            event.killed = 0
        if not event.injured:
            event.injured = 0
        if not event.detained:
            event.detained = 0
        if commit:
            event.save()
        return event


class EventDashboardForm(forms.Form):
    """Form for event dashboard"""
    pass
