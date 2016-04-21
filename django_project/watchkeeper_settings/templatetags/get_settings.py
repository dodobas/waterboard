__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '21/04/16'

from django.template import Library

from watchkeeper_settings.models.watchkeeper_settings import WatchkeeperSettings

register = Library()


@register.assignment_tag
def get_settings(value):
    settings = WatchkeeperSettings.objects.all()[0]
    return getattr(settings, value)
