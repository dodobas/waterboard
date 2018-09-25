# -*- coding: utf-8 -*-


def parse_attributes(attributes, header):
    attribute_list = []
    attribute_list_appendix = []
    for header_item in header:
        header_item_found = False
        for attribute in attributes:
            if header_item == attribute[0]:
                header_item_found = True

                if attribute[1] in ['DropDown', 'Text']:
                    result_type = 'string'
                else:
                    result_type = attribute[1].lower()

                attribute_list.append(
                    {'label': attribute[2].replace(' ', '_').replace('(', '').replace(')', '').replace('/', '_'),
                     'type': result_type, 'key': attribute[0]}
                )
                break

        if not header_item_found:
            attribute_list_appendix.append({'label': header_item, 'type': 'string', 'key': header_item})

    return attribute_list + attribute_list_appendix
