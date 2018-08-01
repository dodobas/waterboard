from dateutil import parser
from openpyxl import load_workbook

def get_dataXLSX_raw(filename):
    """
    Stores all data from XLSX file in a list.

    Takes one parameter: "filename" (string which defines path to XLSX file)

    Returns:
        - boolean value (True if file with specified file name could not be found or if XLSX file doesn't contain sheet
          "waterpoints", False otherwise. If True, program stops executing.)
        - "dataXLSX_raw" (List that contains data from XLSX file. Each row from XLSX file is one list element. Each row
           is stored as another list with cell values as its elements. If boolean value is True, it is error message
           that is being printet out.)
    """

    try:
        wb = load_workbook(filename=filename, read_only=True)
    except FileNotFoundError:
        return True, 'File with specified name could not be found.'

    try:
        ws = wb['waterpoints']
    except KeyError:
        return True, 'There isn\'t "waterpoints" sheet in XLSX file.'

    table = ws.rows

    dataXLSX_raw = []
    for row in table:
        record = []
        for cell in row:
            record.append(cell.value)
        dataXLSX_raw.append(record)

    return False, dataXLSX_raw


def get_data_file(data_raw):
    """
    Stores data from uploaded file in a dictionary.

    Takes one parameter: "data_raw" (list with all data from uploaded file)

    Returns:
        - "header_file" (list with names of columns in uploaded file)
        - "data_file" (Dictionary that contains data from uploaded file. Dictionary keys are uuid values of each record, and
          value is another dictionary with key:value pairs as "key_of_filed_in_database":"value_in corresponding" filed.)
        - boolean value (True if entire first row (header) or one or more header elements are empty, False otherwise. If
          True, program stops executing.)
        - string value (if boolean value is True and program stops executing, this string value is being printed out)
    """

    header_file = []
    try:
        for cell in data_raw[0]:
            header_file.append(cell)
    except IndexError:
        return None, None, True, 'Entire uploaded file is empty.'

    multiplied_uuid = []
    empty = False
    for item in header_file:
        if item is None:
            empty = True
        else:
            empty = False
            break
    if empty:
        return None, None, True, 'First row or entire uploaded file is empty.'

    if None in header_file:
        return None, None, True, 'There are columns without name.'

    data_file = {}
    new = 0
    for index_row, row in enumerate(data_raw[1:]):
        row_file = {}
        for index_cell, cell in enumerate(row):

            if cell == '':
                cell = None

            if header_file[index_cell] == 'ts' and cell is not None:
                cell = parser.parse(cell).isoformat(' ')

            row_file[header_file[index_cell]] = cell

        if row_file['feature_uuid'] in data_file:
            multiplied_uuid.append(row_file['feature_uuid'])

        if row_file['feature_uuid'] == '<new>':
            new += 1
            data_file[row_file['feature_uuid'] + str(new)] = row_file
        else:
            data_file[row_file['feature_uuid']] = row_file

    if len(multiplied_uuid) == 1:
        return None, None, True, 'feature_uuid "{}" is used in more than one row.'.format(multiplied_uuid[0])
    elif len(multiplied_uuid) > 1:
        return None, None, True, 'There are multiple feature_uuid in uploaded file that are used in more than one row. ({})'.format(', '.join(multiplied_uuid))

    return header_file, data_file, False, ''


def for_insert(index_row, row, attributes):
    """
    Checks if data in uploaded file are accordant to constraints in database, i.e. suitable for insert in database.

    Takes three parameters:
            - index_row (index of row in uploaded file that is being checked if it is suitable for insert in database or not)
            - row (dictionary that contains data from row in uploaded file that is being checked for insert)
            - attributes (dictionary with information about constraints for fields in database)

    Returns two values:
            - boolean value (True if row in uploaded file is suitable for insert in database or False if it is not)
            - error_list (List of errors found during checking if values in uploaded file are accordant to constraints in
              database or empty list if no errors were found. Row number in error message is 1-based where first row is
              header.)
    """

    for key, item in row.items():
        if item == None:
            blank_row = True
        else:
            blank_row = False
            break

    if blank_row:
        error_found = True
        return not error_found, 'Row {} is empty.'.format(index_row)

    error_list = []
    error_found = False

    for key, cell in row.items():
        if key in attributes.keys():
            if attributes[key]['required'] is True:
                if cell == '' or cell is None:
                    error_msg = 'value in column "{}" is missing'.format(key, index_row)
                    error_list.append(error_msg)
                    error_found = True

            if attributes[key]['type'] == 'DropDown':
                if cell in attributes[key]['options'] or cell == '' or cell is None:
                    continue
                else:
                    error_msg = 'value in column "{}" is not allowed (it should be one of the predefined values)'.format(key, index_row)
                    error_list.append(error_msg)
                    error_found = True
            elif attributes[key]['type'] == 'Decimal':
                if isinstance(cell, int) or isinstance(cell, float) or cell == '' or cell is None:
                    continue
                else:
                    error_msg = 'value in column "{}" is not allowed (it should be a decimal number)'.format(key, index_row)
                    error_list.append(error_msg)
                    error_found = True
            elif attributes[key]['type'] == 'Integer':
                if isinstance(cell, int) or cell == '' or cell is None:
                    continue
                else:
                    error_msg = 'value in column "{}" is not allowed (it should be a whole number)'.format(key, index_row)
                    error_list.append(error_msg)
                    error_found = True
        elif key in ['point_geometry', 'email', 'ts', 'changeset_id']:
            continue

    if error_found:
        error_msg = 'Row {}: '.format(index_row) + ', '.join(error_list) + '.'
    else:
        error_msg = ''

    return not error_found, error_msg


def for_update(row_file, rowDB):
    """
    Checks if row in uploaded file is equal to record in database with same fature_uuid value.

    Takes two arguments:
            - row_file (dictionary that contains data from row in uploaded file)
            - rowDB (dictionary that contains data from record in database)

    Returns True if row in uploaded file differs from corresponding record in database and False if it doesn't.
    """

    for key, cell_file in row_file.items():

        try:
            colDB = rowDB[key]
        except KeyError:
            continue

        if cell_file == colDB:
            should_be_updated = False
        else:
            should_be_updated = True
            break
    return should_be_updated


def check_headers(header_file, headerDB, attributesDB):
    """
    Checks if there are columns in uploaded file that are not defined in database and if uploaded file doesn't contain columns
    that are required in database.

    Takes three paremeters:
        - header_file (list that contains names of collumns in uploaded file)
        - headerDB (list that contains names of collumns in database)
        - attributes_DB (dictionary with keys same as keys of fileds/attributes in database and values as another
          dictionary with information about type, necessity and predefined values.

    Returns:
        - msg (Empty list if all columns in uploaded file are present in database and if uploaded file contains all columns that
          are required in databse. Othervise it is a list with information about found errors.)
        - boolean value (True if uploaded file doesn't contain all columns that are required in database, othervise False)
    """

    msg = []

    for key, value in attributesDB.items():
        if key not in header_file and value['required'] is True:
            msg.append('"{}"'.format(key))

    if len(msg) == 1:
        return True, 'There is no required colum {} in uploaded file.'.format(msg[0])
    elif len(msg) > 1:
        columns = ''
        for ind, item in enumerate(msg, 1):
            if ind == len(msg):
                columns += ' and {}'.format(item)
            elif ind == 1:
                columns += item
            else:
                columns += ', {}'.format(item)
        return True, 'There are no required columns {} in uploaded file.'.format(columns)

    #todo
    for item in header_file:
        if item not in headerDB:
            msg.append('Column "{}" in uploaded file is not defined in database.'.format(item))
    return False, msg


def check_data(data_file, dataDB, attributes):
    """
    Checks which rows in uploaded file sholud be updated, inserted, deleted or changed before insertion in database.

    Takes three parameters:
        - data_file (dictionary with data from uploaded file)
        - dataDB (dictionary with data from database)
        - attributes (dictionary with information about constraints for fields in database)

    Returns:
        - records_for_insert (list of records that can be inserted in database)
        - records_for_update (list of records that can be updated in database)
        - records_for_delete (list of records that should be deleted from database)
        - errors (list of errors found in data in uploaded file)
        - list with information about how many rows should be inserted, updated, deleted, corrected and how many rows
          don't need any operation to be performed on
    """

    update = 0
    unchanged = 0
    add = 0
    needs_correction = 0
    discarded = 0
    errors = []
    records_for_add = []
    records_for_update = []
    discarded_rows = []

    for ind, (uuid, row) in enumerate(data_file.items()):

        if uuid in dataDB:
            if for_update(row, dataDB[uuid]):
                no_errors, error_msg = for_insert(ind + 2, row, attributes)
                if no_errors:
                    records_for_update.append(row)
                    update += 1
                else:
                    errors.append(error_msg)
                    needs_correction += 1
            else:
                unchanged += 1
        else:
            if uuid[0:5] == '<new>':
                no_errors, error_msg = for_insert(ind + 2, row, attributes)
                if no_errors:
                    records_for_add.append(row)
                    add += 1
                else:
                    errors.append(error_msg)
                    needs_correction += 1
            else:
                discarded += 1
                discarded_rows.append(ind+2)

    discarded_msg = ''
    for ind, item in enumerate(discarded_rows, 1):
        if len(discarded_rows) == 1:
            discarded_msg = 'Row {} has been discarded. (feature_uuid not in databse or not <new>)'.format(item)
            break

        if ind == len(discarded_rows):
            discarded_msg += ' and {} have been discarded. (feature_uuid not in databse or not <new>)'.format(item)
        elif ind == 1:
            discarded_msg = 'Rows {}'.format(item)
        else:
            discarded_msg += ', {}'.format(item)

    return records_for_add, records_for_update, discarded_msg, errors, [add, update, discarded, unchanged, needs_correction]
