import os, django
import sys

from importCSV_functions.functions import for_insert, for_update, get_dataXLSX, check_headers, check_data
from importCSV_functions.get_fromDB import get_attributes, get_dataDB
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.dev_frane")

django.setup()


def funkcija(filename):
    attributes = get_attributes()
    headerDB, dataDB = get_dataDB()
    headerXLSX, dataXLSX, stop, msg = get_dataXLSX(filename)
    if stop:
        sys.exit(msg)

    stop, msg = check_headers(headerXLSX, headerDB)
    if stop:
        sys.exit(msg)

    records_for_insert, records_for_update, records_for_delete, errors, report_list = check_data(dataXLSX, dataDB, attributes)

    print("Inserted: {}\nUpdated: {}\nDeleted: {}\nUnchanged: {}\nNeeds to be corrected: {}".format(report_list[2], report_list[0], report_list[4], report_list[1], report_list[3]))
    print(errors)
    return errors

funkcija('waterpoints_test.xlsx')
