from django.db import connection
import decimal
import uuid
from dateutil import parser
from openpyxl import load_workbook


def for_insert(indr, row, attributes):
    # row number in output message includes header row
    for key, item in row.items():
        if item == '':
            blank_row = True
        else:
            blank_row = False
            break

    if blank_row:
        error_found = True
        return not error_found, ['Row {} is empty'.format(indr)]

    error_list = []
    error_found = False

    for key, cell in row.items():
        if key in attributes.keys():
            if attributes[key]['required'] is True:
                if cell == '' or cell is None:
                    error_msg = 'Value in column {} in row {} is missing.'.format(key, indr)
                    error_list.append(error_msg)
                    error_found = True

            if attributes[key]['type'] == 'DropDown':
                if cell in attributes[key]['options'] or cell == '' or cell is None:
                    continue
                else:
                    error_msg = 'Value in column {} in row {} is not allowed. It should be one of the predefined values.'.format(key, indr)
                    error_list.append(error_msg)
                    error_found = True
            elif attributes[key]['type'] == 'Decimal':
                if isinstance(cell, int) or isinstance(cell, float) or cell == '' or cell is None:
                    continue
                else:
                    error_msg = 'Value in column {} in row {} is not allowed. It should be a decimal number.'.format(key, indr)
                    error_list.append(error_msg)
                    error_found = True
            elif attributes[key]['type'] == 'Integer':
                if isinstance(cell, int) or cell == '' or cell is None:
                    continue
                else:
                    error_msg = 'Value in column {} in row {} is not allowed. It should be a whole number.'.format(key, indr)
                    error_list.append(error_msg)
                    error_found = True
        elif key in ['point_geometry', 'email', 'ts', 'changeset_id']:
            continue
        """else:
            error_msg = 'Column with key {} is not defined in database.'.format(key)
            error_list.append(error_msg)
            error_found = True"""
    return not error_found, error_list


def for_update(rowXLSX, rowDB):

    for key, cellXLSX in rowXLSX.items():

        colDB = rowDB[key]

        if cellXLSX == colDB:
            should_be_updated = False
        else:
            should_be_updated = True
            break
    return should_be_updated


def get_attributes():
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
                if cell is None:
                    cell = ''
                elif isinstance(cell, uuid.UUID):
                    cell = str(cell)
                elif isinstance(cell, decimal.Decimal):
                    cell = float(cell)

                rowDB[headerDB[ind]] = cell

            dataDB[str(rowDB['feature_uuid'])] = rowDB
    return headerDB, dataDB


def get_dataXLSX(filename):
    wb = load_workbook(filename=filename, read_only=True)
    ws = wb['waterpoints']

    table = ws.rows

    headerXLSX = []
    for cell in next(table):
        headerXLSX.append(cell.value)
    if len(headerXLSX) == 0:
        return '', '', True, 'First row or entire XLSX file is empty.'

    dataXLSX = {}
    for indr, row in enumerate(table):
        rowXLSX = {}
        for indc, cell in enumerate(row):
            cell_value = cell.value
            if cell_value is None:
                cell_value = ''
            elif headerXLSX[indc] == 'ts':
                cell_value = parser.parse(cell_value)
            rowXLSX[headerXLSX[indc]] = cell_value
        dataXLSX[rowXLSX['feature_uuid']] = rowXLSX

    if len(dataXLSX) == 0:
        return '', '', True, 'XLSX file is empty.'

    return headerXLSX, dataXLSX, False, ''

def check_headers(XLSX, DB):
    stop = False
    msg = ''
    for item in XLSX:
        if item not in DB:
            msg = 'Column "{}" in XLSX file is not defined in database.'.format(item)
            stop = True
    return stop, msg
