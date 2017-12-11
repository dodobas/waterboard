# coding=utf-8
"""Manage Signals."""

__author__ = 'Christian Christelis <christian@kartoza.com>'
__project_name = 'watchkeeper'
__date__ = '27/05/15'
__copyright__ = 'kartoza.com'
__doc__ = ''

from django.db.models.signals import post_save

from event_mapper.models.event import Event
from event_mapper.models.movement import Movement

from event_mapper.tasks.notify_all_users import notify_all_users
from event_mapper.tasks.notify_priority_users import notify_priority_users

from event_mapper.tasks.movement_notify_all_user import (
    movement_notify_all_users)
from event_mapper.tasks.movement_notify_priority_user import (
    movement_notify_priority_users)


def message_users(sender, instance, **kwargs):
    if kwargs['created']:
        if instance.notified_immediately:
            # This is a priority alert and all users should be notified
            notify_all_users.delay(instance.id)
        else:
            # This is a normal alert and only priority users should be
            # notified
            notify_priority_users.delay(instance.id)


post_save.connect(
    message_users,
    sender=Event,
    dispatch_uid="new_event_notify_users")


def movement_notification(sender, instance, **kwargs):
    if instance.notified_immediately:
        # This is a priority movement update and all users should be notified
        movement_notify_all_users.delay(instance.id)
    else:
        # This is a normal movement update and only priority users should be
        # notified
        movement_notify_priority_users.delay(instance.id)

post_save.connect(
    movement_notification,
    sender=Movement,
    dispatch_uid="update_movement_notify_user")
