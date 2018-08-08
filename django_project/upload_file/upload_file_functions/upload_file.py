# -*- coding: utf-8 -*-
from .functions import get_data_xlsx_raw, get_data_file, check_headers, check_data
from .get_from_db import get_attributes, get_data_db


def core_upload_function(filename):
    if '.' not in str(filename):
        raise BlockingIOError('Uploaded file doesn\'t have extension.')
    else:
        extension = str(filename).split('.')[1].upper()

    attributes = get_attributes()
    header_db, data_db = get_data_db()

    if str(filename).split('.')[1].lower() == 'xlsx':
        try:
            data_xlsx_raw = get_data_xlsx_raw(filename)
        except FileNotFoundError as error:
            raise
        except KeyError as error:
            raise

    # elif ... == 'csv':
    else:
        raise BlockingIOError('{} files are not supported.'.format(extension))

    try:
        header_file, data_file = get_data_file(data_xlsx_raw)
    except IndexError:
        raise
    except LookupError:
        raise
    except KeyError:
        raise

    errors_header = []
    try:
        message = check_headers(header_file, header_db, attributes)
    except LookupError:
        raise

    if len(message) != 0:
        errors_header += message

    records_for_add, records_for_update, discarded_msg, errors, report_list = check_data(data_file, data_db, attributes)
    errors = errors_header + errors

    # print("Added: {}\nUpdated: {}\nDiscarded: {}\nUnchanged: {}\nNeeds to be corrected: {}".format(report_list[0], report_list[1], report_list[2], report_list[3], report_list[4]))
    return records_for_add, records_for_update, discarded_msg, errors, report_list, extension
