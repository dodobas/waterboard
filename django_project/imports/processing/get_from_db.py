# -*- coding: utf-8 -*-
import decimal
import uuid

from django.db import connection


def get_attributes():
    """
    Returns dictionary with keys same as keys of fields/attributes in database and values as another dictionary which
    contains information about type (Decimal, Integer...), whether attribute is required or not, and list of predefined
    values if attribute type is DropDown.
    """

    with connection.cursor() as cur:
        cur.execute("""
            SELECT attributes_attribute.key, attributes_attribute.result_type, attributes_attribute.required,
                attributes_attribute.id
            FROM public.attributes_attribute
            ORDER BY attributes_attribute.id ASC;
                                            """)
        attributes_db = cur.fetchall()
        attributes = {}

        for item in attributes_db:
            attributes[item[0]] = {'type': item[1], 'required': item[2], 'id': str(item[3])}

        cur.execute("""
            SELECT attributes_attributeoption.attribute_id, attributes_attributeoption.option
            FROM public.attributes_attributeoption;
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


def get_data_db():
    """
    Returns list "headerDB" with names of fields in database and dictionary "dataDB" with keys equal to corresponding
    uuid value of each feature in database and values as another dictionary with key:value pairs as "name of filed":
    "value in corresponding filed".
    """

    with connection.cursor() as cur:
        cur.execute("""SELECT * FROM features.active_data;""")

        data_from_db = {}
        header_db = []

        for key in cur.description:
            header_db.append(key[0])

        for row in cur.fetchall():
            row_db = {}

            for ind, cell in enumerate(row):
                if cell == '':
                    cell = None
                elif isinstance(cell, uuid.UUID):
                    cell = str(cell)
                elif isinstance(cell, decimal.Decimal):
                    cell = float(cell)
                elif header_db[ind] == 'ts':
                    cell = cell.isoformat(' ')

                row_db[header_db[ind]] = cell

            data_from_db[str(row_db['feature_uuid'])] = row_db

    return header_db, data_from_db
