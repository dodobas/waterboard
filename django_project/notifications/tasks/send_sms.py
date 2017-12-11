# coding=utf-8
"""Send sms alert."""

__author__ = 'Christian Christelis <christian@kartoza.com>'
__project_name = 'watchkeeper'
__date__ = '8/05/15'
__copyright__ = 'kartoza.com'
__doc__ = ''

from celery import shared_task

from sms.models import Message
from sms.models import Gateway

from notifications.models import Notification


class GatewayException(Exception):
    pass


@shared_task
def send_sms_message(user, message):

    msg = Message.objects.create(
        recipient_number=user.phone_number,
        content=message,
        sender=user,
        billee=user
    )
    try:
        gateway = Gateway.objects.all()[0]
    except:
        raise GatewayException('Gateway Not Configured')

    msg.send(gateway)
    Notification(alert_type='sms', recipient=user, message_content=message).save()