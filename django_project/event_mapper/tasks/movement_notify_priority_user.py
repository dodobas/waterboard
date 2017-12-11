# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'movement_notify_all_user'
__date__ = '7/30/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

from datetime import datetime
from celery import shared_task
from celery.utils.log import get_task_logger

from notifications.tasks.send_email import send_email_message
from notifications.tasks.send_sms import send_sms_message

from event_mapper.models.user import User
from event_mapper.models.movement import Movement

logger = get_task_logger(__name__)


@shared_task
def movement_notify_priority_users(movement_id):
    movement = Movement.objects.get(id=movement_id)
    users = User.objects.filter(
        countries_notified__polygon_geometry__contains=
        movement.boundary.polygon_geometry,
        notify_immediately=True)

    logger.info('Send movement to all users on %s' % datetime.now())
    logger.info(movement.text_report())
    logger.info(
        'Movement notified immediately: %s' % movement.notified_immediately)

    for user in users:
        send_email_message(user, movement.text_report(), movement.html_report())
