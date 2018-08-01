from django.db import connection
import decimal
import uuid
from datetime import datetime

def get_attributes():
    """
    Returns dictionary with keys same as keys of fields/attributes in database and values as another dictionary which
    contains information about type (Decimal, Integer...), whether attribute is required or not, and list of predefined
    values if attribute type is DropDown.
    """

    with connection.cursor() as cur:
        cur.execute("""
             SELECT attributes_attribute.key, attributes_attribute.result_type, attributes_attribute.required, attributes_attribute.id FROM public.attributes_attribute ORDER BY attributes_attribute.id ASC
                                            """)
        attributes_db = cur.fetchall()
        attributes = {}

        for item in attributes_db:
            attributes[item[0]] = {'type': item[1], 'required': item[2], 'id': str(item[3])}

        cur.execute("""
            SELECT attributes_attributeoption.attribute_id, attributes_attributeoption.option FROM public.attributes_attributeoption
                                            """)
        attribute_options = cur.fetchall()
        options = {}
        for item in attribute_options:
            att_id = str(item[0])
            if att_id in options.keys():
                options[att_id].append(item[1])
            else:
                options[att_id] = [item[1]]

        for key, value in attributes.items():
            if value['id'] in options:
                attributes[key]['options'] = options[value['id']]
    return attributes


def get_dataDB():
    """
    Returns list "headerDB" with names of fields in database and dictionary "dataDB" with keys equal to corresponding
    uuid value of each feature in database and values as another dictionary with key:value pairs as "name of filed":
    "value in corresponding filed".
    """

    with connection.cursor() as cur:
        cur.execute("""
                    SELECT * FROM features.active_data
                                               """)

        dataDB = {}
        headerDB = []

        for item in cur.description:
            headerDB.append(item[0])

        for item in cur.fetchall():
            rowDB = {}

            for ind, cell in enumerate(item):
                if cell == '':
                    cell = None
                elif isinstance(cell, uuid.UUID):
                    cell = str(cell)
                elif isinstance(cell, decimal.Decimal):
                    cell = float(cell)
                elif headerDB[ind] == 'ts':
                    cell = cell.isoformat(' ')

                rowDB[headerDB[ind]] = cell

            dataDB[str(rowDB['feature_uuid'])] = rowDB
    return headerDB, dataDB
