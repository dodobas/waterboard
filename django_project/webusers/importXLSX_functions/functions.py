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


def get_dataXLSX(dataXLSX_raw):
    """
    Stores data from XLSX file in a dictionary.

    Takes one parameter: "dataXLSX_raw" (list with all data from XLSX file)

    Returns:
        - "headerXLSX" (list with names of columns in XLSX file)
        - "dataXLSX" (Dictionary that contains data from XLSX file. Dictionary keys are uuid values of each record, and
          value is another dictionary with key:value pairs as "key_of_filed_in_database":"value_in corresponding" filed.)
        - boolean value (True if entire first row (header) or one or more header elements are empty, False otherwise. If
          True, program stops executing.)
        - string value (if boolean value is True and program stops executing, this string value is being printed out)
    """

    headerXLSX = []
    try:
        for cell in dataXLSX_raw[0]:
            headerXLSX.append(cell)
    except IndexError:
        return None, None, True, 'Entire XLSX file is empty.'

    empty = False
    for item in headerXLSX:
        if item is None:
            empty = True
        else:
            empty = False
            break
    if empty:
        return None, None, True, 'First row or entire XLSX file is empty.'

    if None in headerXLSX:
        return None, None, True, 'There are columns without name.'

    dataXLSX = {}
    new = 0
    for index_row, row in enumerate(dataXLSX_raw[1:]):
        rowXLSX = {}
        for index_cell, cell in enumerate(row):

            if cell == '':
                cell = None

            if headerXLSX[index_cell] == 'ts' and cell is not None:
                cell = parser.parse(cell)

            rowXLSX[headerXLSX[index_cell]] = cell

        if rowXLSX['feature_uuid'] == '<new>':
            new += 1
            dataXLSX[rowXLSX['feature_uuid'] + str(new)] = rowXLSX
        else:
            dataXLSX[rowXLSX['feature_uuid']] = rowXLSX

    return headerXLSX, dataXLSX, False, ''


def for_insert(index_row, row, attributes):
    """
    Checks if data in XLSX file are accordant to constraints in database, i.e. suitable for insert in database.

    Takes three parameters:
            - index_row (index of row in XLSX file that is being checked if it is suitable for insert in database or not)
            - row (dictionary that contains data from row in XLSX file that is being checked for insert)
            - attributes (dictionary with information about constraints for fields in database)

    Returns two values:
            - boolean value (True if row from XLSX file is suitable for insert in database or False if it is not)
            - error_list (List of errors found during checking if values in XLSX file are accordant to constraints in
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


def for_update(rowXLSX, rowDB):
    """
    Checks if row in XLSX file is equal to record in database with same uuid value.

    Takes two arguments:
            - rowXLSX (dictionary that contains data from row in XLSX file)
            - rowDB (dictionary that contains data from record in database)

    Returns True if row in XLSX file differs from corresponding record in database and False if it doesn't.
    """

    for key, cellXLSX in rowXLSX.items():

        try:
            colDB = rowDB[key]
        except KeyError:
            continue

        if cellXLSX == colDB:
            should_be_updated = False
        else:
            should_be_updated = True
            break
    return should_be_updated


def check_headers(headerXLSX, headerDB, attributesDB):
    """
    Checks if there are columns in XLSX file that are not defined in database and if XLSX file doesn't contain columns
    that are required in database.

    Takes three paremeters:
        - headerXLSX (list that contains names of collumns in XLSX file)
        - headerDB (list that contains names of collumns in database)
        - attributes_DB (dictionary with keys same as keys of fileds/attributes in database and values as another
          dictionary with information about type, necessity and predefined values.

    Returns:
        - msg (Empty list if all columns in XLSX file are present in database and if XLSX file contains all columns that
          are required in databse. Othervise it is a list with information about found errors.)
        - boolean value (True if XLSX doesn't contain all columns that are required in database, othervise False)
    """

    msg = []

    for key, value in attributesDB.items():
        if key not in headerXLSX and value['required'] is True:
            msg.append('"{}"'.format(key))

    if len(msg) == 1:
        return True, 'There is no required colum {} in XLSX file.'.format(msg[0])
    elif len(msg) > 1:
        columns = ''
        for ind, item in enumerate(msg, 1):
            if ind == len(msg):
                columns += ' and {}'.format(item)
            elif ind == 1:
                columns += item
            else:
                columns += ', {}'.format(item)
        return True, 'There are no required columns {} in XLSX file.'.format(columns)

    #todo
    for item in headerXLSX:
        if item not in headerDB:
            msg.append('Column "{}" in XLSX file is not defined in database.'.format(item))
    return False, msg


def check_data(dataXLSX, dataDB, attributes):
    """
    Checks which rows in XLSX file sholud be updated, inserted, deleted or changed before insertion in database.

    Takes three parameters:
        - dataXLSX (dictionary with data from XLSX file)
        - dataDB (dictionary with data from database)
        - attributes (dictionary with information about constraints for fields in database)

    Returns:
        - records_for_insert (list of records that can be inserted in database)
        - records_for_update (list of records that can be updated in database)
        - records_for_delete (list of records that should be deleted from database)
        - errors (list of errors found in data in XLSX file)
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
    discarded_records = []

    for ind, (uuid, row) in enumerate(dataXLSX.items()):

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
                discarded_records.append(row)

    return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
