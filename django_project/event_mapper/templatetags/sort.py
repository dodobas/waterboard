__author__ = 'Irwan Fathurrahman <irwan@kartoza.com>'
__date__ = '20/06/16'
__license__ = "GPL"
__copyright__ = 'kartoza.com'

from django import template
from django.utils.datastructures import SortedDict

register = template.Library()


@register.filter(name='sort')
def sort(value):
    if isinstance(value, dict):
        new_dict = SortedDict()
        key_list = value.keys()
        key_list.sort()
        for key in key_list:
            new_dict[key] = value[key]
        return new_dict
    elif isinstance(value, list):
        new_list = list(value)
        new_list.sort()
        return new_list
    else:
        return value


sort.is_safe = True
