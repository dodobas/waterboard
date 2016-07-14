__author__ = 'Christian Christelis <christian@kartoza.com>'
__date__ = '15/04/16'

import requests

from django.core.exceptions import ObjectDoesNotExist
from django.core.management.base import BaseCommand

from django.contrib.gis.geos import Point

from healthsites.models.healthsite import Healthsite

import logging

logger = logging.getLogger(__name__)

API_URL = 'https://healthsites.io/api/v1/healthsites/facilities?page='


class Command(BaseCommand):
    help = (""
            "This script serves to synchronize healthsite locations between "
            "healthsites.io and HCID. "
            "(Currently this is a one way from healthsites.io to HCID.)")

    def ingest(self, healthsite_data):
        uuid = healthsite_data['uuid']
        try:
            healthsite = Healthsite.objects.get(uuid=uuid)
            version = healthsite.version
        except Healthsite.DoesNotExist:
            healthsite = Healthsite()
            healthsite.uuid = uuid
            version = None

        if version != healthsite_data['version']:
            if 'name' in healthsite_data:
                name = healthsite_data['name']
                healthsite.name = name.strip()[:100]
                healthsite.point_geometry = Point(healthsite_data['geom'])
                healthsite.version = healthsite_data['version']
                healthsite.date = healthsite_data['date_modified']
                healthsite.is_healthsites_io = True
                healthsite.save()

    def handle(self, *args, **options):
        """Get the healthsites data and add it to the DB."""

        for count in xrange(1, 100000):
            page_url = '%s%s' % (API_URL, count)
            request = requests.get(page_url)
            logging.info(
                "%s found %s records" % (page_url, len(request.json())))
            if not request.ok:
                break
            if not request.json():
                break
            for healthsite_data in request.json():
                self.ingest(healthsite_data)
