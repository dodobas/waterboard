__author__ = 'Irwan Fathurrahman <irwan@kartoza.com>'
__date__ = '25/04/16'
__license__ = "GPL"
__copyright__ = 'kartoza.com'

import os
import json
from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder
from healthsites.map_clustering import cluster, parse_bbox
from healthsites.models.healthsite import Healthsite


def healthsites_clustering(bbox, zoom, iconsize):
    # parse request params
    if zoom <= settings.CLUSTER_CACHE_MAX_ZOOM:
        # if geoname and tag are not set we can return the cached layer
        # try to read healthsitesfrom disk

        filename = os.path.join(
            settings.CLUSTER_CACHE_DIR,
            '{}_{}_{}_healthsites.json'.format(zoom, *iconsize)
        )

        try:
            cached_locs = open(filename, 'rb')
            cached_data = cached_locs.read()
            return cached_data
        except IOError as e:
            localities = Healthsite.objects.all()
            object_list = cluster(localities, zoom, *iconsize)

            # create the missing cache
            with open(filename, 'wb') as cache_file:
                json_dump = json.dump(object_list, cache_file)
            return json_dump
    else:
        # make polygon
        bbox_poly = parse_bbox(bbox)
        # cluster healthsites for a view
        healthsites = Healthsite.objects.filter(point_geometry__contained=bbox_poly)
        object_list = cluster(healthsites, zoom, *iconsize)
        return json.dumps(object_list, cls=DjangoJSONEncoder)
