# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals


def integrate_data(changeset1_values, changeset2_values, attributes_dict):
    returning_dict = {}

    for key, value in changeset1_values.items():
        if key in attributes_dict:
            returning_dict[attributes_dict[key]] = {
                'changeset1_value': '-' if value is None else value,
                'changeset2_value': '-' if changeset2_values[key] is None else changeset2_values[key]
            }

    return returning_dict


def find_differences(table):
    different_labels = []

    for label, values in table.items():
        if values['changeset1_value'] != values['changeset2_value']:
            different_labels.append(label)

    return different_labels


def get_metadata(changeset_values):
    metadata_dict = {}

    metadata_dict['email'] = changeset_values['email']
    metadata_dict['ts'] = changeset_values['_created_date']

    return metadata_dict
