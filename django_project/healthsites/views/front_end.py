# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'front_end.py'
__date__ = '5/7/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

from django.shortcuts import render


def contact(request):
    """Landing page."""
    return render(request, 'event_mapper/contact.html')
