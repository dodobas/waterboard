# -*- coding: utf-8 -*-


def parse_attributes(attributes, header):
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


def parse_data(cursor_description, cursor_fetchall):
    data = []
    header = []

    for key in cursor_description:
        header.append(key[0])

    for row in cursor_fetchall:
        record = {}

        for ind, cell in enumerate(row):
            if cell == cell is None:
                cell = ''
            elif header[ind] == 'ts':
                cell = cell.isoformat(' ')

            record[header[ind]] = cell

        data.append(record)

    return data
