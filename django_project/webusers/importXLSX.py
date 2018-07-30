from .importXLSX_functions.functions import get_dataXLSX_raw, get_dataXLSX, check_headers, check_data
from .importXLSX_functions.get_fromDB import get_attributes, get_dataDB

def core_upload_function(filename):
    attributes = get_attributes()
    headerDB, dataDB = get_dataDB()

    stop, dataXLSX_raw = get_dataXLSX_raw(filename)
    if stop:
        return False, dataXLSX_raw, None, None, None

    headerXLSX, dataXLSX, stop, message = get_dataXLSX(dataXLSX_raw)
    if stop:
        return False, message, None, None, None

    errors_header = []
    stop, message = check_headers(headerXLSX, headerDB, attributes)
    if stop:
        return False, message, None, None, None
    elif len(message) != 0:
        errors_header += message

    records_for_add, records_for_update, discarded_records, errors, report_list = check_data(dataXLSX, dataDB, attributes)
    errors = errors_header + errors

    #print("Added: {}\nUpdated: {}\nDiscarded: {}\nUnchanged: {}\nNeeds to be corrected: {}".format(report_list[0], report_list[1], report_list[2], report_list[3], report_list[4]))
    return records_for_add, records_for_update, discarded_records, errors, report_list

core_upload_function('waterpoints_test.xlsx')
