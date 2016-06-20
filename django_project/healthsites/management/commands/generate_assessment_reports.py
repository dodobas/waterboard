__author__ = 'Irwan Fathurrahman <irwan@kartoza.com>'
__date__ = '20/06/16'
__license__ = "GPL"
__copyright__ = 'kartoza.com'

from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.db.models import Count
from healthsites.tasks.daily_assessment_report import generate_report
from healthsites.models.assessment import HealthsiteAssessment
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        """Get the healthsites data and add it to the DB."""

        # daily_pdf_report()
        assessment_times = HealthsiteAssessment.objects.extra(
            select={'year': "EXTRACT(year FROM created_date)",
                    'month': "EXTRACT(month from created_date)",
                    'day': "EXTRACT(day from created_date)"}). \
            values('year',
                   'month',
                   'day'). \
            annotate(Count('healthsite'))
        for time in assessment_times:
            date = datetime.strptime("%d %d %d" % (time['year'], time['month'], time['day']), '%Y %m %d')
            daily_pdf_report(date)


def daily_pdf_report(date):
    start_time = date
    end_time = start_time + timedelta(days=1)
    generate_report(start_time, end_time)
