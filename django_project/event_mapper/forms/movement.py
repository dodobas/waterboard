# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'movement'
__date__ = '5/11/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

from django import forms
from django.contrib.contenttypes.models import ContentType

from event_mapper.utilities.commons import get_verbose_name, get_help_text

from event_mapper.models.movement import Movement
from event_mapper.models.country import Country
from event_mapper.models.province import Province
from datetime import datetime


class MovementUpdateForm(forms.Form):
    """A form for rating a movement."""
    region = forms.ModelChoiceField(
        label='Country',
        queryset=Country.objects.order_by('name'),
        widget=forms.Select(
            attrs={
                'class': 'form-control'
            }
        ),
    )

    province = forms.CharField(
        label='Province/State',
        required=False,
        widget=forms.Select(
            attrs={
                'class': 'form-control'
            }
        ),
    )

    risk_level = forms.ChoiceField(
        label='New risk level',
        widget=forms.Select(
            attrs={'class': 'form-control'}),
        choices=Movement.RISK_LEVELS,
    )

    movement_state = forms.ChoiceField(
        label='New movement state',
        widget=forms.Select(
            attrs={'class': 'form-control'}),
        choices=Movement.MOVEMENT_STATES,
    )

    notified_immediately = forms.BooleanField(
        label=get_verbose_name(Movement, 'notified_immediately'),
        help_text=get_help_text(Movement, 'notified_immediately'),
        widget=forms.CheckboxInput(
            attrs={'class': ''}),
        required=False
    )

    notes = forms.CharField(
        label=get_verbose_name(Movement, 'notes'),
        widget=forms.Textarea(
            attrs={'class': 'form-control',
                   'placeholder': get_help_text(Movement, 'notes')}),
        required=False,
    )

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        self.country_id = kwargs.pop('country_id', None)
        super(MovementUpdateForm, self).__init__(*args, **kwargs)

    # def save(self, commit=True):
    #     """Override save method."""
    #     data = self.cleaned_data
    #     movement = super(MovementUpdateForm, self).save(commit=False)
    #
    #     movement.last_updater = self.user
    #     movement.country = data.region
    #     if commit:
    #         movement.save()
    #     return movement

    def update(self):
        data = self.cleaned_data
        country = self.cleaned_data['region']
        province_id = self.cleaned_data['province']
        if province_id != '0':
            boundary = Province.objects.get(pk=province_id)
            province_type = ContentType.objects.get_for_model(Province)
            movement_query = Movement.objects.filter(
                boundary_type=province_type,
                boundary_id=province_id)
        else:
            boundary = country
            country_type = ContentType.objects.get_for_model(Country)
            movement_query = Movement.objects.filter(
                boundary_type=country_type,
                boundary_id=country.id)
        if movement_query:
            movement = movement_query[0]
        else:
            movement = Movement(boundary=boundary)
        movement.risk_level = data['risk_level']
        movement.movement_state = data['movement_state']
        movement.notes = data['notes']
        movement.last_updater = self.user
        movement.last_updated_time = datetime.now()
        movement.id = boundary.id
        movement.notified_immediately = data['notified_immediately']
        movement.save()
        return movement


class MovementViewForm(forms.Form):
    """A form for rating a movement."""
    region = forms.ModelChoiceField(
        label='Country',
        queryset=Country.objects.order_by('name'),
        widget=forms.Select(
            attrs={
                'class': 'form-control'
            }
        ),
    )

    province = forms.CharField(
        label='Province/State',
        required=False,
        widget=forms.Select(
            attrs={
                'class': 'form-control'
            }
        ),
    )

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        self.country_id = kwargs.pop('country_id', None)
        super(MovementViewForm, self).__init__(*args, **kwargs)
