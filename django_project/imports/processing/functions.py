# -*- coding: utf-8 -*-
from openpyxl import load_workbook

from .errors import FileError, MultipleUuidError, NoRequiredColumnError, UnnamedColumnError

IGNORED_ATTRIBUTES = ['changeset', 'email', 'ts']


def get_data_xlsx_raw(pathname):
    """
    Stores all data from XLSX file in a list.

    Takes one parameter: "pathname" (string which defines path to XLSX file)

    Returns:
        - "data_xlsx_raw" (List that contains data from XLSX file. Each row from XLSX file is one list element. Each row
           is stored as another list with cell values as its elements.)

    Exception is raised if file with specified file name could not be found or if XLSX file doesn't contain sheet
    "waterpoints".
    """

    try:
        work_book = load_workbook(filename=pathname, read_only=True)
    except FileNotFoundError:
        raise FileError('File with specified name could not be found.')

    try:
        work_sheet = work_book['waterpoints']
    except KeyError:
        raise FileError('There isn\'t "waterpoints" sheet in XLSX file.')

    table = work_sheet.rows

    data_xlsx_raw = []
    for row in table:
        record = []
        for cell in row:
            record.append(cell.value)

        # discard completely empty rows
        if all(rec is None for rec in record):
            continue

        data_xlsx_raw.append(record)

    return data_xlsx_raw


def check_file_header(data_raw):
    """
    Checks if header in uploaded file is properly defined.

    Takes one parameter: "data_raw" (list with all data from uploaded file)

    Returns:
        - "header_file" (list with names of columns in uploaded file)

    Exception is raised if entire uploaded file or entire first row (header) is empty or if one or more column names are
    not defined.
    """

    header_file = []
    try:
        for cell in data_raw[0]:
            header_file.append(cell)
    except IndexError:
        raise FileError('Entire uploaded file is empty.')

    empty = False
    for item in header_file:
        if item is None:
            empty = True
        else:
            empty = False
            break
    if empty:
        raise FileError('First row or entire uploaded file is empty.')

    if None in header_file:
        raise UnnamedColumnError('There are columns without name.')

    return header_file


def get_data_file(data_raw):
    """
    Stores data from uploaded file in a dictionary.

    Takes one parameter: "data_raw" (list with all data from uploaded file)

    Returns:
        - "header_file" (list with names of columns in uploaded file)
        - "data_file" (Dictionary that contains data from uploaded file. Dictionary keys are feature_uuid values of each
          record, and value is another dictionary with key:value pairs as "key_of_filed_in_database":"value_in
          corresponding" filed.)

     or if there are
    Exception is raised if there are duplicated feature_uuid values in uploaded file.
    """

    header_file = check_file_header(data_raw)

    multiplied_uuid = []
    data_file = {}
    new = 0
    none_num = 0
    for index_row, row in enumerate(data_raw[1:]):
        row_file = {}
        for index_cell, cell in enumerate(row):

            if header_file[index_cell] in IGNORED_ATTRIBUTES:
                continue

            if cell == '':
                cell = None

            row_file[header_file[index_cell]] = cell

        if (row_file['feature_uuid'] in data_file) and (row_file['feature_uuid'] not in multiplied_uuid):
            if row_file['feature_uuid'] is None:
                pass
            else:
                multiplied_uuid.append(row_file['feature_uuid'])

        if row_file['feature_uuid'] == '<new>':
            new += 1
            data_file[row_file['feature_uuid'] + str(new)] = row_file
        elif row_file['feature_uuid'] is None:
            none_num += 1
            data_file[str(row_file['feature_uuid']) + str(none_num)] = row_file
        else:
            data_file[row_file['feature_uuid']] = row_file

    if len(multiplied_uuid) == 1:
        raise MultipleUuidError(f'feature_uuid "{str(multiplied_uuid[0])}" is used in more than one row.')
    elif len(multiplied_uuid) > 1:
        for ind, item in enumerate(multiplied_uuid):
            multiplied_uuid[ind] = str(item)
        raise MultipleUuidError(
            'There are multiple feature_uuid in uploaded file that are used in more than one row. '
            f'({", ".join(multiplied_uuid)})'
        )

    for index, item in enumerate(header_file):
        if item in IGNORED_ATTRIBUTES:
            del (header_file[index])

    return header_file, data_file


def empty_row(row):
    """
    Checks if row is empty.

    Takes one parameter "row" (dictionary with data from one row from uploaded file)

    Returns boolean value which is True if row is empty or False otherwise.
    """

    for key, item in row.items():
        if item is None:
            empty = True
        else:
            empty = False
            break
    return empty


def for_insert(index_row, row, attributes):
    """
    Checks if data in uploaded file are accordant to constraints in database, i.e. suitable for insert in database.

    Takes three parameters:
            - "index_row" (index of row in uploaded file that is being checked if it is suitable for insert in database
              or not)
            - "row" (dictionary that contains data from row in uploaded file that is being checked for insert)
            - "attributes" (dictionary with information about constraints for fields in database)

    Returns two values:
            - not "error_found" (True if row in uploaded file is suitable for insert in database or False if it is not)
            - "error_msg" (String that contains information about errors that have been found during checking if values
              in uploaded file are accordant to constraints in database or empty string if no errors were found. Row
              number in error message is 1-based where first row is header.)
    """

    error_list = []
    error_found = False

    for key, cell in row.items():
        if key in attributes.keys():
            if attributes[key]['required'] is True:
                if cell == '' or cell is None:
                    error_msg = f'value in column "{str(key)}" is missing'
                    error_list.append(error_msg)
                    error_found = True

            if attributes[key]['type'] == 'DropDown':
                if cell in attributes[key]['options'] or cell == '' or cell is None:
                    continue
                else:
                    error_msg = (f'value in column "{str(key)}" is not allowed '
                                 '(it should be one of the predefined values)')
                    error_list.append(error_msg)
                    error_found = True
            elif attributes[key]['type'] == 'Decimal':
                if isinstance(cell, int) or isinstance(cell, float) or cell == '' or cell is None:
                    continue
                else:
                    error_msg = f'value in column "{str(key)}" is not allowed (it should be a decimal number)'
                    error_list.append(error_msg)
                    error_found = True
            elif attributes[key]['type'] == 'Integer':
                if isinstance(cell, int) or cell == '' or cell is None:
                    continue
                else:
                    error_msg = f'value in column "{str(key)}" is not allowed (it should be a whole number)'
                    error_list.append(error_msg)
                    error_found = True
        elif key in ['point_geometry', 'email', 'ts', 'changeset_id']:
            continue

    if error_found:
        error_msg = f'Row {str(index_row)}: ' + ', '.join(error_list) + '.'
    else:
        error_msg = ''

    return not error_found, error_msg


def for_update(row_file, row_db):
    """
    Checks if row in uploaded file is equal to record in database with same feature_uuid value.

    Takes two arguments:
            - "row_file" (dictionary that contains data from row in uploaded file)
            - "row_db" (dictionary that contains data from record in database)

    Returns "should be updated" boolean value which is True if row in uploaded file differs from corresponding record in
    database and False if it doesn't.
    """

    for key, cell_file in row_file.items():

        try:
            col_db = row_db[key]
        except KeyError:
            continue

        if cell_file == col_db:
            should_be_updated = False
        else:
            should_be_updated = True
            break
    return should_be_updated


def check_headers(header_file, header_db, attributes_db):
    """
    Checks if there are columns in uploaded file that are not defined in database and if uploaded file doesn't contain
    columns that are required in database.

    Takes three parameters:
        - "header_file" (list that contains names of columns in uploaded file)
        - "header_db" (list that contains names of columns in database)
        - "attributes_db" (dictionary with keys same as keys of fields/attributes in database and values as another
          dictionary with information about type, necessity and predefined values of each attribute.

    Returns:
        - "msg" (List with messages about columns in uploaded file that aren't defined in database. Empty list if there
          all columns in uploaded file are present in database.)

    Exception is raised if uploaded file doesn't contain columns that are required in database.
    """

    msg = []

    for key, value in attributes_db.items():
        if key not in header_file and value['required'] is True:
            msg.append(f'"{str(key)}"')

    if len(msg) == 1:
        raise NoRequiredColumnError(f'There is no required colum {msg[0]} in uploaded file.')
    elif len(msg) > 1:
        columns = ''
        for ind, item in enumerate(msg, 1):
            if ind == len(msg):
                columns += f' and {str(item)}'
            elif ind == 1:
                columns += item
            else:
                columns += f', {str(item)}'
        raise NoRequiredColumnError(f'There are no required columns {columns} in uploaded file.')

    for item in header_file:
        if item in IGNORED_ATTRIBUTES:
            continue
        if item not in header_db:
            msg.append(
                f'Column "{str(item)}" in uploaded file is not defined in database. Data will be inserted in '
                f'database without values in column "{str(item)}".'
            )
    return msg


def check_data(data_file, data_db, attributes):
    """
    Checks which rows in uploaded file should be updated, inserted, deleted or changed before insertion in database.

    Takes three parameters:
        - "data_file" (dictionary with data from uploaded file)
        - "data_db" (dictionary with data from database)
        - "attributes" (dictionary with information about constraints for fields in database)

    Returns:
        - "records_for_insert" (list of records that can be inserted in database)
        - "records_for_update" (list of records that can be updated in database)
        - "discarded_msg" (string that contains numbers of rows that have been discarded because their feature_uuid is
          not defined in database and is not <new>)
        - "errors" (list of errors that have been found in uploaded file)
        - dictionary with information about how many rows can be inserted and updated, how many rows are discarded and
          unchanged and how many rows needs to be corrected
    """

    update = 0
    unchanged = 0
    add = 0
    needs_correction = 0
    discarded = 0
    errors = []
    warnings = []
    records_for_add = []
    records_for_update = []
    discarded_rows = []

    for ind, (uuid, row) in enumerate(data_file.items()):

        if uuid[0:4] == 'None':
            if empty_row(row):
                warnings.append(f'Row {str(ind + 2)} is empty.')
                needs_correction += 1
                continue
            else:
                discarded += 1
                discarded_rows.append(ind + 2)
                continue
        if len(uuid) < 6:
            discarded += 1
            discarded_rows.append(ind + 2)
            continue

        if uuid in data_db:
            if for_update(row, data_db[uuid]):
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
                discarded_rows.append(ind + 2)

    for ind, item in enumerate(discarded_rows, 1):
        if len(discarded_rows) == 1:
            discarded_msg = f'Row {str(item)} was discarded. (feature_uuid not in database or not <new>)'
            errors += [discarded_msg]
            break

        if ind == len(discarded_rows):
            discarded_msg += f' and {str(item)} were discarded. (feature_uuid not in database or not <new>)'
            errors += [discarded_msg]
        elif ind == 1:
            discarded_msg = f'Rows {str(item)}'
        else:
            discarded_msg += f', {str(item)}'

    return records_for_add, records_for_update, warnings, errors, {
        'num_add': add, 'num_update': update, 'num_discarded': discarded, 'num_unchanged': unchanged,
        'num_needs_correction': needs_correction
    }
