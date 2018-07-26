import os, django
import sys

from importXLSX_functions.functions import for_insert, for_update, get_dataXLSX_raw, get_dataXLSX, check_headers, check_data
from importXLSX_functions.get_fromDB import get_attributes, get_dataDB
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.dev_frane")

django.setup()


def funkcija(filename):
    attributes = get_attributes()
    headerDB, dataDB = get_dataDB()

    stop, dataXLSX_raw = get_dataXLSX_raw(filename)
    if stop:
        sys.exit(dataXLSX_raw)

    headerXLSX, dataXLSX, stop, message = get_dataXLSX(dataXLSX_raw)
    if stop:
        sys.exit(message)

    errors_header = []
    stop, message = check_headers(headerXLSX, headerDB, attributes)
    if stop:
        sys.exit(message)
    elif len(message) != 0:
        errors_header += message


    records_for_add, records_for_update, discarded_records, errors, report_list = check_data(dataXLSX, dataDB, attributes)
    errors = errors_header + errors

    #print("Added: {}\nUpdated: {}\nDiscarded: {}\nUnchanged: {}\nNeeds to be corrected: {}".format(report_list[0], report_list[1], report_list[2], report_list[3], report_list[4]))
    return records_for_add, records_for_update, discarded_records, errors

funkcija('waterpoints_test.xlsx')
