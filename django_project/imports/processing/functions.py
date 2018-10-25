# -*- coding: utf-8 -*-
from openpyxl import load_workbook

from .errors import FileError, MultipleUuidError, NoRequiredColumnError, UnnamedColumnError

IGNORED_ATTRIBUTES = {'changeset', 'email', 'ts'}


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

        data_xlsx_raw.append(record)

    return data_xlsx_raw


def check_file_header(data_raw):
    """
    Checks if header in uploaded file is properly defined.

    Takes one parameter: "data_raw" (list with all data from uploaded file)

    Returns:
        - "header_row" (list with names of columns in uploaded file)

    Exception is raised if entire uploaded file or entire first row (header) is empty or if one or more column names are
    not defined.
    """

    header_row = []
    try:
        for cell in data_raw[0]:
            header_row.append(cell)
    except IndexError:
        raise FileError('Entire uploaded file is empty.')

    empty = False
    for item in header_row:
        if item is None:
            empty = True
        else:
            empty = False
            break
    if empty:
        raise FileError('First row or entire uploaded file is empty.')

    if None in header_row:
        raise UnnamedColumnError('There are columns without name.')

    return header_row


def parse_data_file(data_raw):
    """
    Stores data from uploaded file in a dictionary.

    Takes one parameter: "data_raw" (list with all data from uploaded file)

    Returns:
        - "header_row" (list with names of columns in uploaded file)
        - "parsed_data_from_file" (Dictionary that contains data from uploaded file. Dictionary keys are feature_uuid
          values of each record, and value is another dictionary with key:value pairs as
          "key_of_filed_in_database":"value_in corresponding" field.)

     or if there are
    Exception is raised if there are duplicated feature_uuid values in uploaded file.
    """

    header_row = check_file_header(data_raw)

    multiple_uuids = set()

    parsed_data_from_file = {}
    new_feature_count = 0

    for row_index, row in enumerate(data_raw[1:]):
        row_from_file = {}

        for index_cell, cell in enumerate(row):

            # skip any attributes that might be in IGNORED_ATTRIBUTES
            if header_row[index_cell] in IGNORED_ATTRIBUTES and header_row[index_cell] != 'changeset':
                continue

            if cell == '':
                cell = None

            # add attribute data
            row_from_file[header_row[index_cell]] = cell

        if row_from_file['feature_uuid'] in parsed_data_from_file:
            multiple_uuids.add(row_from_file['feature_uuid'])

        # rows with a blank feature_uuid are going to be inserted in the database
        if not row_from_file['feature_uuid']:
            new_feature_count += 1
            generated_feature_uuid = f'new_feature_uuid_{str(new_feature_count)}'

            # replace feature_uuid in row_from_file
            row_from_file['feature_uuid'] = generated_feature_uuid

            parsed_data_from_file[generated_feature_uuid] = row_from_file
        else:
            parsed_data_from_file[row_from_file['feature_uuid']] = row_from_file

    if multiple_uuids:
        raise MultipleUuidError(
            f'There are feature_uuid in uploaded file that are duplicates: {", ".join(multiple_uuids)}'
        )

    new_header_file = []
    for item in header_row:
        if item not in IGNORED_ATTRIBUTES:
            new_header_file.append(item)

    return new_header_file, parsed_data_from_file


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
                    error_msg = (
                        f'value in column "{str(key)}" is not allowed (it should be one of the predefined values)'
                    )
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

    should_be_updated = False

    for key, cell_file in row_file.items():
        if key == 'changeset':
            continue

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
        raise NoRequiredColumnError(f'There is no required column {msg[0]} in uploaded file.')
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
        if item not in header_db:
            msg.append(
                f'Column "{str(item)}" in uploaded file is not defined in database. Data will be inserted in '
                f'database without values in column "{str(item)}".'
            )
    return msg


def construct_discarded_msg(discarded_rows):
    """
    Takes one parameter: "discarded_rows" (list that contains numbers of rows that were discarded)

    Returns string with information about which rows were discarded.
    """

    discarded_msg = ''

    for ind, item in enumerate(discarded_rows, 1):
        if len(discarded_rows) == 1:
            discarded_msg = f'Row {str(item)} was discarded.'
            return discarded_msg

        if ind == len(discarded_rows):
            discarded_msg += f' and {str(item)} were discarded.'
        elif ind == 1:
            discarded_msg = f'Rows {str(item)}'
        else:
            discarded_msg += f', {str(item)}'

    return discarded_msg


def check_data(data_from_file, data_from_db, attributes):
    """
    Checks which rows in uploaded file should be updated, inserted, deleted or changed before insertion in database.

    Takes three parameters:
        - "data_from_file" (dictionary with data from uploaded file)
        - "data_from_db" (dictionary with data from database)
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
    discarded_rows_uuid = []
    discarded_rows_changeset = []

    for ind, (uuid, row) in enumerate(data_from_file.items()):
        if uuid in data_from_db:

            try:
                changeset_from_file = int(row['changeset'])
            except (KeyError, TypeError):
                changeset_ok = True
            except ValueError:
                no_errors, error_msg = for_insert(ind + 2, row, attributes)
                if no_errors:
                    errors.append(
                        f'Row {str(ind+2)}: value in column "changeset" is not allowed (it should be a whole number).'
                    )
                else:
                    errors.append(
                        error_msg.replace('.', ', ') + (
                            'value in column "changeset" is not allowed (it should be a whole number).')
                    )
                needs_correction += 1
                continue
            else:
                if int(changeset_from_file) == data_from_db[uuid]['changeset_id']:
                    changeset_ok = True
                else:
                    changeset_ok = False

            if changeset_ok:
                if for_update(row, data_from_db[uuid]):
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
                discarded += 1
                discarded_rows_changeset.append(ind + 2)
        else:
            # if uuid is not defined, we insert the row
            if uuid.startswith('new_feature_uuid_'):
                no_errors, error_msg = for_insert(ind + 2, row, attributes)
                if no_errors:
                    records_for_add.append(row)
                    add += 1
                else:
                    errors.append(error_msg)
                    needs_correction += 1
            else:
                discarded += 1
                discarded_rows_uuid.append(ind + 2)

    if discarded_rows_uuid:
        errors += [construct_discarded_msg(discarded_rows_uuid) + ' (feature_uuid not in database or not blank)']

    if discarded_rows_changeset:
        errors += [construct_discarded_msg(discarded_rows_changeset) + ' (changeset is not the most recent one)']

    return records_for_add, records_for_update, warnings, errors, {
        'num_add': add, 'num_update': update, 'num_discarded': discarded, 'num_unchanged': unchanged,
        'num_needs_correction': needs_correction
    }
