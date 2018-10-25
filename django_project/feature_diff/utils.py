# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from dateutil.parser import parse


def integrate_data(changeset1_values, changeset2_values, attributes):
    returning_list = []

    group_label = ''

    for attribute in attributes:
        for key, value in changeset1_values.items():
            if attribute['key'] == key:
                if attribute['group_label'] != group_label:
                    group_label = attribute['group_label']
                    returning_list.append(group_label)

                returning_list.append({
                    'label': attribute['label'],
                    'changeset1_value': '<~NULL~>' if value is None or value == '' else value,
                    'changeset2_value': '<~NULL~>' if changeset2_values[key] is None or changeset2_values[key] == ''
                    else changeset2_values[key]
                })

    return returning_list


def find_differences(table):
    different_labels = []

    for item in table:
        if type(item) is dict:
            if item['changeset1_value'] != item['changeset2_value']:
                different_labels.append(item['label'])

    return different_labels


def get_metadata(changeset_values, changeset_id, available_changeset_ids, changeset_types):
    metadata_dict = {}

    metadata_dict['email'] = changeset_values['email']
    metadata_dict['ts'] = changeset_values['_created_date']
    metadata_dict['changeset_type'] = changeset_types[available_changeset_ids.index(changeset_id)]

    if changeset_id == available_changeset_ids[0]:
        metadata_dict['next'] = None
    else:
        metadata_dict['next'] = available_changeset_ids[available_changeset_ids.index(changeset_id) - 1]

    if changeset_id == available_changeset_ids[-1]:
        metadata_dict['previous'] = None
    else:
        metadata_dict['previous'] = available_changeset_ids[available_changeset_ids.index(changeset_id) + 1]

    return metadata_dict
