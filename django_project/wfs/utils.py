# -*- coding: utf-8 -*-
import decimal
import uuid

from django.db import connection


def get_attributes():
    with connection.cursor() as cursor:
        cursor.execute("""
        SELECT attributes_attribute.key, attributes_attribute.result_type
        FROM public.attributes_attribute
        WHERE attributes_attribute.is_active = TRUE;
        """)

        attributes = cursor.fetchall()

        cursor.execute('SELECT * FROM features.active_data LIMIT 1;')

        header = []
        for key in cursor.description:
            header.append(key[0])

    attribute_list = []
    for header_item in header:
        header_item_found = False
        for attribute in attributes:
            if header_item == attribute[0]:
                header_item_found = True

                if attribute[1] in ['DropDown', 'Text']:
                    result_type = 'string'
                else:
                    result_type = attribute[1].lower()

                attribute_list.append({'key': attribute[0], 'type': result_type})
                break

        if not header_item_found:
            attribute_list.append({'key': header_item, 'type': 'string'})

    return attribute_list


def get_data():
    with connection.cursor() as cursor:
        cursor.execute('SELECT * FROM features.active_data;')

        data = []
        header = []

        for key in cursor.description:
            header.append(key[0])

        for row in cursor.fetchall():
            record = {}

            for ind, cell in enumerate(row):
                if cell == cell is None:
                    cell = ''
                elif isinstance(cell, uuid.UUID):
                    cell = str(cell)
                elif isinstance(cell, decimal.Decimal):
                    cell = float(cell)
                elif header[ind] == 'ts':
                    cell = cell.isoformat(' ')

                record[header[ind]] = cell

            data.append(record)

    return data
