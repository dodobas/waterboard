# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'daily_pdf_report'
__date__ = '8/3/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

import os
import cStringIO as StringIO
from xhtml2pdf import pisa

from datetime import datetime, timedelta
from celery import shared_task
from celery.utils.log import get_task_logger
from django.conf.global_settings import MEDIA_ROOT
from django.template.loader import render_to_string


logger = get_task_logger(__name__)

from event_mapper.models.event import Event
from event_mapper.models.movement import Movement
from event_mapper.models.daily_report import DailyReport

reports_directory = os.path.abspath(os.path.join(
    MEDIA_ROOT,
    os.path.pardir,
    'reports'))


def generate_html_report(start_time, end_time):
    """Return an rst report for event and movement and the number of them.

    :param start_time: Starting time.
    :param end_time: End time.

    :returns: RST report and the number of event and movement
    :rtype: (str, int, int)
    """
    incident_events = Event.objects.filter(
        date_time__gt=start_time,
        date_time__lt=end_time,
        category=1)
    incident_advisory = Event.objects.filter(
        date_time__gt=start_time,
        date_time__lt=end_time,
        category=2)
    events = Event.objects.filter(
        date_time__gt=start_time,
        date_time__lt=end_time)
    movements = Movement.objects.filter(
        last_updated_time__gt=start_time,
        last_updated_time__lt=end_time)
    context = {
        'incident_events': incident_events,
        'incident_advisory': incident_advisory,
        'movements': movements,
        'start_date': start_time.strftime('%A %d %B %Y'),
        'end_date': end_time.strftime('%H:%M:%S, %A %d %B %Y'),
    }

    report_html = render_to_string(
        'email_templates/daily_alerts.html',
        context)

    return report_html.replace('\n', ''), len(events), len(movements)


def test_html_report():
    """Test for generate_html_report."""
    from datetime import datetime, timedelta
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=15)
    html_report, _, _ = generate_html_report(start_time, end_time)
    return html_report


def test_generate_pdf_report():
    """Test for generate_pdf_report."""
    from datetime import datetime, timedelta
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=45)
    generate_report(start_time, end_time)


def html_to_pdf(data, filename):
    pdf = pisa.CreatePDF(StringIO.StringIO(data.encode('utf-8')), file(filename, "wb"), encoding='utf-8')
    return not pdf.err


def generate_report(start_time, end_time):
    """Return an rst report for event and movement.

    :param start_time: Starting time.
    :param end_time: End time.

    """
    raw_report, num_event, num_movement = generate_html_report(
        start_time, end_time)
    filename = start_time.strftime('IMMAP_Report_%Y%m%d') + '.pdf'
    file_path = os.path.join(reports_directory, filename)
    if not os.path.exists(reports_directory):
        logger.info('Reports directory not exists')
        os.makedirs(reports_directory)
    else:
        logger.info('Reports directory exists')

    # Put the pdf generation here
    # xhtml2pdf
    success = html_to_pdf(raw_report, file_path)
    if success:
        logger.info(
            'Success to generate daily report for %s in %s' % (start_time.strftime('%Y %m %d'), file_path))
    else:
        logger.info('Failed to generate daily report for  %s' % start_time.strftime('%Y %m %d'))

    if os.path.exists(file_path):
        daily_report = DailyReport()
        daily_report.start_time = start_time
        daily_report.end_time = end_time
        daily_report.event_number = num_event
        daily_report.movement_number = num_movement
        daily_report.file_path = file_path
        daily_report.date_time = start_time
        daily_report.save()


@shared_task(name='tasks.daily_pdf_report')
def daily_pdf_report():
    logger.info('Generate daily pdf report on %s' % datetime.now())
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=1)

    generate_report(start_time, end_time)
