# -*- coding: utf-8 -*-
from os.path import splitext

from .errors import FileError
from .functions import check_data, check_headers, get_data_xlsx_raw, parse_data_file
from .get_from_db import get_attributes, get_data_db


def process_file(pathname):
    """
    Main function for processing uploaded file.

    Takes one parameter: pathname (string that contains pathname of the uploaded file)

    Returns:
        - "records_for_add" (list with records that can be added to database)
        - "records_for_update" (list with records that can be updated)
        - "warnings" (list with warning that were found during processing uploaded file)
        - "errors" (list with errors that were found during processing uploaded file)
        - "report_dict" (dictionary with information about how many rows can be inserted and updated, how many rows are
           discarded and unchanged and how many rows needs to be corrected)
    """

    if '.' not in str(pathname):
        raise FileError('Uploaded file doesn\'t have extension.')
    else:
        extension = splitext(str(pathname))[1]

    attributes = get_attributes()
    header_from_db, data_from_db = get_data_db()

    if extension.lower() == '.xlsx':
        data_xlsx_raw = get_data_xlsx_raw(pathname)

    # elif extension.lower() == '.csv':
    else:
        # TODO change this message
        raise FileError(
            f'{extension.split(".")[1].upper()} files are not supported. Only XLSX files are currently supported.'
        )

    header_from_file, data_from_file = parse_data_file(data_xlsx_raw)

    message = check_headers(header_from_file, header_from_db, attributes)

    records_for_add, records_for_update, warnings, errors, report_dict = check_data(
        data_from_file, data_from_db, attributes
    )

    if len(message) != 0:
        warnings += message
    return records_for_add, records_for_update, warnings, errors, report_dict
