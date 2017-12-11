# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'daily_report.py'
__date__ = '7/27/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

from datetime import datetime, timedelta
from celery import shared_task
from celery.utils.log import get_task_logger
from notifications.tasks.send_email import send_email_message
from notifications.tasks.send_sms import send_sms_message
from event_mapper.models.event import Event
from event_mapper.models.event import User
from event_mapper.models.movement import Movement

from django.template.loader import render_to_string


logger = get_task_logger(__name__)


@shared_task(name='tasks.daily_report')
def daily_report():
    logger.info('Send daily report on %s' % datetime.now())
    # Get all events in the last 24 hours.
    # All times are in UTC

    start_time = datetime.utcnow().replace(
        hour=0, minute=0, second=0, microsecond=0)
    end_time = datetime.utcnow()

    incident_events = Event.objects.filter(
        date_time__gt=end_time - timedelta(days=1),
        date_time__lt=end_time,
        category=1)
    incident_advisory = Event.objects.filter(
        date_time__gt=end_time - timedelta(days=1),
        date_time__lt=end_time,
        category=2)
    movements = Movement.objects.filter(
        last_updated_time__gt=end_time - timedelta(days=1),
        last_updated_time__lt=end_time)
    context = {
        'incident_events': incident_events,
        'incident_advisory': incident_advisory,
        'movements': movements,
        'start_date': start_time.strftime('%A %d %B %Y'),
        'end_date': end_time.strftime('%H:%M:%S, %A %d %B %Y'),
    }
    report_plain = render_to_string(
        'email_templates/daily_alerts.txt',
        context)

    report_html = render_to_string(
        'email_templates/daily_alerts.html',
        context)
    logger.info(report_plain)

    # Do not send email notification if no events or movement updates
    if len(incident_advisory) == 0 and len(movements) == 0 and len(incident_events) == 0:
        logger.info('There is no event or movement, so we do not send daily email.')
        return

    title = 'iMMAP Watchkeeper Daily Situational Report - %s' % (
        end_time.strftime('%A %d %B %Y'))
    # Send email to all user
    users = User.objects.all()
    for user in users:
        logger.info('send email to %s' % user.get_full_name())
        send_email_message(user, report_plain, report_html, title)
