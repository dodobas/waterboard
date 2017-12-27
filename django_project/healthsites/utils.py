# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

import json
import os

from django.conf import settings
from django.contrib.gis.geos import Point
from django.core.serializers.json import DjangoJSONEncoder

from .map_clustering import cluster, parse_bbox
from .models.assessment import (
    HealthsiteAssessment
)
from .models.healthsite import Healthsite


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
        except IOError:
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
        healthsites = Healthsite.objects.filter(point_geometry__contained=bbox_poly, is_healthsites_io=True)
        object_list = cluster(healthsites, zoom, *iconsize)
        return json.dumps(object_list, cls=DjangoJSONEncoder)


def clean_parameter(parameters):
    new_json = {}
    for parameter in parameters.keys():
        splitted_param = parameter.split('/', 1)
        # parser to json
        if len(splitted_param) == 1:
            # if doesn't has group
            new_json[parameter] = parameters[parameter]
        elif len(splitted_param) > 1:
            # if has group
            if not splitted_param[0] in new_json:
                new_json[splitted_param[0]] = {}
            new_json[splitted_param[0]][splitted_param[1]] = parameters[parameter]
    return new_json


def pre_processing_create_event(user, json_values):
    try:
        import uuid
        # assessment_id
        assessment_id = -99
        if 'assessment_id' in json_values and json_values['assessment_id'] != '':
            assessment_id = json_values['assessment_id']

        geom = Point(
            float(json_values['latitude']), float(json_values['longitude'])
        )
        healthsite = None
        try:
            assessment = HealthsiteAssessment.objects.get(id=assessment_id)
            healthsite = assessment.healthsite
        except HealthsiteAssessment.DoesNotExist:
            if 'healthsite_id' in json_values and json_values['healthsite_id'] != '':
                try:
                    healthsite = Healthsite.objects.get(id=json_values['healthsite_id'])
                except Healthsite.DoesNotExist:
                    pass
            # if healthsite is not found
            if not healthsite:
                # generate new uuid
                tmp_uuid = uuid.uuid4().hex
                healthsite = Healthsite(name=json_values['name'], point_geometry=geom, uuid=tmp_uuid, version=1)
                healthsite.save()

        assessment = HealthsiteAssessment.objects.create(
            name=json_values['name'], point_geometry=geom,
            healthsite=healthsite, data_captor=user, overall_assessment=json_values['overall_assessment'])

        return assessment
    except Exception as e:
        print(e)


def create_event(user, json_values):
    assessment = pre_processing_create_event(user, json_values)
    HealthsiteAssessment.objects.filter(
        healthsite=assessment.healthsite, current=True).update(current=False)
    insert_values(assessment, json_values)
    return assessment


def update_event(user, json_values):
    # assessment_id
    assessment_id = -99
    if 'assessment_id' in json_values and json_values['assessment_id'] != '':
        assessment_id = json_values['assessment_id']
    try:
        assessment = HealthsiteAssessment.objects.get(id=assessment_id)
        assessment.overall_assessment = json_values['overall_assessment']
        assessment.name = json_values['name']
        geom = Point(
            float(json_values['latitude']), float(json_values['longitude'])
        )
        assessment.point_geometry = geom
        insert_values(assessment, json_values)
        return assessment
    except HealthsiteAssessment.DoesNotExist:
        return None


def insert_values(assessment, json_values):
    assessment.overall_assessment = json_values['overall_assessment']
    assessment.save()
    for key in json_values.keys():
        try:
            child_json = json_values[key]
            for child_key in child_json.keys():
                try:
                    if child_json[child_key] != '':
                        criteria = AssessmentCriteria.objects.get(name=child_key, assessment_group__name=key)
                        if criteria.result_type == 'Integer':
                            # insert the value
                            # entry decimal
                            insert_update_to_entry(
                                HealthsiteAssessmentEntryInteger, assessment, criteria, int(child_json[child_key]))
                        elif criteria.result_type == 'Decimal':
                            # entry decimal
                            insert_update_to_entry(
                                HealthsiteAssessmentEntryReal, assessment, criteria, float(child_json[child_key]))
                        else:
                            # entry dropdown
                            insert_update_to_entry(
                                HealthsiteAssessmentEntryDropDown, assessment, criteria, child_json[child_key])
                except AssessmentCriteria.DoesNotExist:
                    pass
        except AttributeError:
            pass


def insert_update_to_entry(model, assessment, criteria, value):
    try:
        result = model.objects.get(
            healthsite_assessment=assessment,
            assessment_criteria=criteria)
        result.selected_option = value
        result.save()
    except model.DoesNotExist:
        model.objects.create(
            healthsite_assessment=assessment,
            assessment_criteria=criteria,
            selected_option=value)


def get_overall_assessments(healthsite):
    assessments = HealthsiteAssessment.objects.filter(
        healthsite=healthsite).order_by('created_date')
    return assessments
