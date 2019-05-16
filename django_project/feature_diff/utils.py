import json

from dateutil.parser import parse
from django.utils.safestring import mark_safe


def tmpl_attachments(attachments):
    return mark_safe(
        '<br>'.join(
            f'<a href="/api/v1/download-attachment/{attach["attachment_uuid"]}">{attach["filename"]}</a>'
            for attach in attachments
        )
    )


def integrate_data(changeset1_values, changeset2_values, attributes):
    returning_list = []

    group_label = ''

    for attribute in attributes:
        for key in changeset1_values.keys():
            if attribute['key'] == key:
                if attribute['group_label'] != group_label:
                    group_label = attribute['group_label']
                    returning_list.append(group_label)

                if attribute['result_type'] == 'Attachment':
                    val1 = changeset1_values.get(key)
                    val2 = changeset2_values.get(key)

                    returning_list.append({
                        'label': attribute['label'],
                        'changeset1_value': tmpl_attachments(json.loads(val1) if val1 else []),
                        'changeset2_value': tmpl_attachments(json.loads(val2) if val2 else [])
                    })
                else:
                    val1 = changeset1_values.get(key)
                    val2 = changeset2_values.get(key)

                    returning_list.append({
                        'label': attribute['label'],
                        'changeset1_value': val1 or '-',
                        'changeset2_value': val2 or '-'
                    })

    return returning_list


def find_differences(table):
    different_labels = []

    for item in table:
        if type(item) is dict:
            if item['changeset1_value'] != item['changeset2_value']:
                different_labels.append(item['label'])

    return different_labels


def get_metadata(changeset_values, changeset_id, available_changeset_ids):
    metadata_dict = {}

    metadata_dict['email'] = changeset_values['email']
    metadata_dict['ts'] = parse(changeset_values['_created_date']).strftime('%Y-%m-%d %H:%M:%S %Z')

    if changeset_id == available_changeset_ids[0]:
        metadata_dict['next'] = None
    else:
        metadata_dict['next'] = available_changeset_ids[available_changeset_ids.index(changeset_id) - 1]

    if changeset_id == available_changeset_ids[-1]:
        metadata_dict['previous'] = None
    else:
        metadata_dict['previous'] = available_changeset_ids[available_changeset_ids.index(changeset_id) + 1]

    return metadata_dict
