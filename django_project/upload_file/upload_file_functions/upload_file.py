from .functions import get_dataXLSX_raw, get_data_file, check_headers, check_data
from .get_fromDB import get_attributes, get_dataDB

def core_upload_function(filename):
    # todo print out which rows are discarded
    if '.' not in str(filename):
        return False, 'Uploaded file doesn\'t have extension.', None, None, None, None
    else:
        extension = str(filename).split('.')[1].upper()
    attributes = get_attributes()
    headerDB, dataDB = get_dataDB()

    if str(filename).split('.')[1].lower() == 'xlsx':
        stop, dataXLSX_raw = get_dataXLSX_raw(filename)
        if stop:
            return False, dataXLSX_raw, None, None, None, None
    #elif ... == 'csv':
    else:
        return False, 'File extension is not allowed.', None, None, None, None


    header_file, data_file, stop, message = get_data_file(dataXLSX_raw)
    if stop:
        return False, message, None, None, None, None

    errors_header = []
    stop, message = check_headers(header_file, headerDB, attributes)
    if stop:
        return False, message, None, None, None, None
    elif len(message) != 0:
        errors_header += message

    records_for_add, records_for_update, discarded_records, errors, report_list = check_data(data_file, dataDB, attributes)
    errors = errors_header + errors

    #print("Added: {}\nUpdated: {}\nDiscarded: {}\nUnchanged: {}\nNeeds to be corrected: {}".format(report_list[0], report_list[1], report_list[2], report_list[3], report_list[4]))
    return records_for_add, records_for_update, discarded_records, errors, report_list, extension
