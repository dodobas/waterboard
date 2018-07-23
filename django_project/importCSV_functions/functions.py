from dateutil import parser
from openpyxl import load_workbook


def get_dataXLSX(filename):
    """
    Stores data from XLSX file in dictionary.

    Takes one parameter: filename (string which defines path to XLSX file)

    Returns:
        - headerXLSX (list with names of columns in XLSX file)
        - dataXLSX (dictionary that contains data from XLSX file)
        - boolean value (True if entire first row (header) or one or more header elements are empty, False otherwise. If
          True, program stops executing.)
        - string value (if boolean value is True and program stops executing, this string value is being printed out)
    """
    try:
        wb = load_workbook(filename=filename, read_only=True)
    except FileNotFoundError:
        return '', '', True, 'File with specified name could not be found.'
    ws = wb['waterpoints']

    table = ws.rows

    headerXLSX = []
    for cell in next(table):
        headerXLSX.append(cell.value)

    empty = False
    for item in headerXLSX:
        if item is None:
            empty = True
        else:
            empty = False
            break
    if empty:
        return '', '', True, 'First row or entire XLSX file is empty.'

    if None in headerXLSX:
        return '', '', True, 'There are columns without name.'

    dataXLSX = {}
    for row in table:
        rowXLSX = {}
        for indc, cell in enumerate(row):
            cell_value = cell.value
            if cell_value is None:
                cell_value = ''
            elif headerXLSX[indc] == 'ts':
                cell_value = parser.parse(cell_value)
            rowXLSX[headerXLSX[indc]] = cell_value
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
        if item == '':
            blank_row = True
        else:
            blank_row = False
            break

    if blank_row:
        error_found = True
        return not error_found, ['Row {} is empty.'.format(index_row)]

    error_list = []
    error_found = False

    for key, cell in row.items():
        if key in attributes.keys():
            if attributes[key]['required'] is True:
                if cell == '' or cell is None:
                    error_msg = 'Value in column {} in row {} is missing.'.format(key, index_row)
                    error_list.append(error_msg)
                    error_found = True

            if attributes[key]['type'] == 'DropDown':
                if cell in attributes[key]['options'] or cell == '' or cell is None:
                    continue
                else:
                    error_msg = 'Value in column {} in row {} is not allowed. It should be one of the predefined values.'.format(key, index_row)
                    error_list.append(error_msg)
                    error_found = True
            elif attributes[key]['type'] == 'Decimal':
                if isinstance(cell, int) or isinstance(cell, float) or cell == '' or cell is None:
                    continue
                else:
                    error_msg = 'Value in column {} in row {} is not allowed. It should be a decimal number.'.format(key, index_row)
                    error_list.append(error_msg)
                    error_found = True
            elif attributes[key]['type'] == 'Integer':
                if isinstance(cell, int) or cell == '' or cell is None:
                    continue
                else:
                    error_msg = 'Value in column {} in row {} is not allowed. It should be a whole number.'.format(key, index_row)
                    error_list.append(error_msg)
                    error_found = True
        elif key in ['point_geometry', 'email', 'ts', 'changeset_id']:
            continue
        """else:
            error_msg = 'Column with key {} is not defined in database.'.format(key)
            error_list.append(error_msg)
            error_found = True"""
    return not error_found, error_list


def for_update(rowXLSX, rowDB):
    """
    Checks if record from database is equal to row in XLSX file with same uuid value.

    Takes two arguments:
            - rowXLSX (dictionary that contains data from row in XLSX file)
            - rowDB (dictionary that contains data from record in database)

    Returns True if row in XLSX file differs from corresponding record in database and False if it doesn't.
    """

    for key, cellXLSX in rowXLSX.items():

        colDB = rowDB[key]

        if cellXLSX == colDB:
            should_be_updated = False
        else:
            should_be_updated = True
            break
    return should_be_updated


def check_headers(XLSX, DB):
    """
    Checks if in XLSX file there are columns that are not defined in database.

    Takes two paremeters:
        - XLSX (list that contains names of collumns in XLSX file)
        - DB (list that contains names of columns in database)

    Returns:
        - stop (True if there is column in XLSX file that is not defined in database, False otherwise. If True, program
          stops executing.)
        - msg (if stop is True msg is string with information about which column in XLSX file is not defined in database
          and if stop is False it is empty string)
    """

    stop = False
    msg = ''
    for item in XLSX:
        if item not in DB:
            msg = 'Column "{}" in XLSX file is not defined in database.'.format(item)
            stop = True
    return stop, msg


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
    insert = 0
    needs_correction = 0
    delete = 0
    errors = []
    records_for_insert = []
    records_for_delete = []
    records_for_update = []

    for ind, (uuid, row) in enumerate(dataXLSX.items()):
        if uuid in dataDB:
            if for_update(row, dataDB[uuid]):
                no_errors, error_list = for_insert(ind + 2, row, attributes)
                if no_errors:
                    records_for_update.append(row)
                    update += 1
                else:
                    errors = errors + error_list
                    needs_correction += 1
            else:
                unchanged += 1
        else:
            if uuid == '<delete>':
                records_for_delete.append(row)
                delete += 1
                continue

            no_errors, error_list = for_insert(ind + 2, row, attributes)
            if no_errors:
                records_for_insert.append(row)
                insert += 1
            else:
                errors = errors + error_list
                needs_correction += 1
    return records_for_insert, records_for_update, records_for_delete, errors, [update, unchanged, insert, needs_correction, delete]
