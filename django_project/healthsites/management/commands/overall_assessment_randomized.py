__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '15/04/16'

import random
import requests
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from healthsites.models.assessment import HealthsiteAssessment

import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        """Get the healthsites data and add it to the DB."""

        for assessment in HealthsiteAssessment.objects.all():
            overall = random.randint(1, 5)
            print overall
            assessment.overall_assessment = overall
            assessment.save()
