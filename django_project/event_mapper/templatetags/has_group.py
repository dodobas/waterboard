__author__ = 'Irwan Fathurrahman <irwan@kartoza.com>'
__date__ = '18/05/16'
__license__ = "GPL"
__copyright__ = 'kartoza.com'

from django import template
from django.contrib.auth.models import Group

register = template.Library()


@register.filter(name='has_group')
def has_group(user, group_name):
    if not user.is_authenticated():
        return False
    if user.is_staff or user.is_admin:
        return True
    try:
        group = Group.objects.get(name=group_name)
        return True if group in user.groups.all() else False
    except Group.DoesNotExist:
        return False
