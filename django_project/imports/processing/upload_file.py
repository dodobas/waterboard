# -*- coding: utf-8 -*-
from os.path import splitext

from .functions import check_data, check_headers, get_data_file, get_data_xlsx_raw
from .get_from_db import get_attributes, get_data_db


def core_upload_function(filename):
    if '.' not in str(filename):
        raise ValueError('Uploaded file doesn\'t have extension.<br>Please upload new file.')
    else:
        extension = splitext(str(filename))[1]

    attributes = get_attributes()
    header_db, data_db = get_data_db()

    if extension.lower() == '.xlsx':
        try:
            data_xlsx_raw = get_data_xlsx_raw(filename)
        except ValueError:
            raise

    # elif extension.lower() == '.csv':
    else:
        # TODO change this message
        raise ValueError('{} files are not supported.<br>Only XLSX files are currently suported.<br>Please upload new file.'.format(extension))

    try:
        header_file, data_file = get_data_file(data_xlsx_raw)
    except ValueError:
        raise

    try:
        message = check_headers(header_file, header_db, attributes)
    except ValueError:
        raise

    records_for_add, records_for_update, warnings, errors, report_list = check_data(data_file, data_db, attributes)

    if len(message) != 0:
        warnings += message
    # print("Added: {}\nUpdated: {}\nDiscarded: {}\nUnchanged: {}\nNeeds to be corrected: {}".format(report_list[0], report_list[1], report_list[2], report_list[3], report_list[4]))
    return records_for_add, records_for_update, warnings, errors, report_list
