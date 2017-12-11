# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'index.py'
__date__ = '3/27/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

"""Views."""
from django.shortcuts import render


def index(request):
    """Landing page."""
    return render(request, 'event_mapper/index.html')
