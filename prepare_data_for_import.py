import csv
import itertools
import re
from collections import defaultdict, Counter
import difflib

import openpyxl

MIN_SIMILAR_VALUES = 3
MIN_SIMLARITY_RATIO = 0.75

# path = '/home/dodobas/WORK/waterboard/Water points of whole Tigray Imported into new database-November 2018.xlsx'
path = '/home/dodobas/WORK/waterboard/data_for_import_20181109.xlsx'

SPEC = {
    'Unique_Id', 'Zone', 'Woreda', 'Tabiya', 'Kushet', 'Site_Name', 'Scheme_Type', 'Year_of_Construction', 'Result',
    'Well Use', 'Depth', 'Yield', 'Static_Water_Level', 'Pump_Type', 'Power_Source', 'Functioning',
    'Reason_of_Non_Functioning', 'Intervention_Required', 'Ave_Dist_from_near_Village (km)', 'Beneficiaries',
    'Femal Beneficiaries', 'Water_Committe_Exist', 'By Law (Sirit)', 'Fund_Raise', 'Amount_of_Deposited_', 'Bank book',
    'Fencing_Exist', 'Guard', 'Livestock', 'Funded_By', 'Constructed_By', 'General_Condition', 'Name_of_Data_Collector',
    'Date_of_Data_Collection', 'Name_and_tel_of_Contact_Person', 'Latitude', 'Longitude', 'Altitude', 'Accuracy',
    'Img Picture_of_Scehem'
}

SPECIAL_CHARS = {'!', '&', ';', ':', '`', '~'}


def clean_value(value):
    if value:
        return str(value).strip().strip('\n').replace('\n', ' ')


def find_similar(values_set, value, num=2):
    sim_ratios = [(val, difflib.SequenceMatcher(None, value, val).ratio()) for val in values_set if val != value]

    return [
        sim_ratio[0] for sim_ratio in sorted(sim_ratios, key=lambda x: x[1], reverse=True) if
        sim_ratio[1] > MIN_SIMLARITY_RATIO
    ][:num]


def check_text(col_name, errors, warnings, clean_rows, required=False, show_missing=False, unique=False, regex=None, max_length=None, min_length=None, check_special=True, set_titlecase=False, set_uppercase=False):

    if col_name not in SPEC:
        raise ValueError(f'{col_name} not found in col spec!')

    unique_set = set()

    print(f'Checking: {col_name}', end='')

    for row_idx, row in clean_rows.items():
        val = row.get(col_name)

        if val is None or val == '':
            if required:
                errors[row_idx].append(f'{col_name}: Value cannot be empty')
            if show_missing:
                warnings[row_idx].append(f'{col_name}: Value should not be empty')

            continue

        if unique:
            if val in unique_set:
                warnings[row_idx].append(f'{col_name}: Value already in unique set: {val}')
            else:
                unique_set.add(val)

        if regex and not re.fullmatch(regex, val):
            warnings[row_idx].append(f'{col_name}: Value not as specified: {val}')

        if max_length and len(val) > max_length:
            warnings[row_idx].append(f'{col_name}: Value longer than (max_length={max_length}), got: {len(val)}, {val}')

        if min_length and len(val) < min_length:
            warnings[row_idx].append(f'{col_name}: Value shorter than (min_length={min_length}), got: {len(val)}, {val}')

        if check_special:
            error_chars = set()
            for char in val:
                if char in SPECIAL_CHARS:
                    error_chars.add(char)
            if error_chars:
                warnings[row_idx].append(f'{col_name}: Has special characters: {error_chars}')

        if set_titlecase:
            val = val.title()

        if set_uppercase:
            val = val.upper()

        # set the new value, trim at max length
        row[col_name] = val[:max_length]

        # add errors
        row['_import_errors'] = ';;;'.join(errors[row_idx]) if errors[row_idx] else ''
        row['_import_warnings'] = ';;;'.join(warnings[row_idx]) if warnings[row_idx] else ''

    print('...done')


def check_dropdown(col_name, errors, warnings, clean_rows, required=False, show_missing=False, max_length=None, min_length=None, check_special=True, set_titlecase=True, set_uppercase=False, check_similar=False):
    if col_name not in SPEC:
        raise ValueError(f'{col_name} not found in col spec!')

    value_set = set()
    val_counts = Counter()

    print(f'Checking: {col_name}', end='')
    for row_idx, row in clean_rows.items():
        val = row.get(col_name)

        if val is None or val == '':
            if required:
                errors[row_idx].append(f'{col_name}: Value cannot be empty')
            if show_missing:
                warnings[row_idx].append(f'{col_name}: Value should not be empty')

            continue

        if max_length and len(val) > max_length:
            warnings[row_idx].append(f'{col_name}: Value longer than (max_length={max_length}), got: {len(val)}, {val}')

        if min_length and len(val) < min_length:
            warnings[row_idx].append(f'{col_name}: Value shorter than (min_length={min_length}), got: {len(val)}, {val}')

        if check_special:
            error_chars = set()
            for char in val:
                if char in SPECIAL_CHARS:
                    error_chars.add(char)
            if error_chars:
                warnings[row_idx].append(f'{col_name}: Has special characters: {error_chars}')

        # transform value
        if set_titlecase:
            val = val.title()

        if set_uppercase:
            val = val.upper()

        val_counts[val] += 1
        value_set.add(val)

        # set the new value, trim at max length
        row[col_name] = val[:max_length]

        # add errors
        row['_import_errors'] = ';;;'.join(errors[row_idx]) if errors[row_idx] else ''
        row['_import_warnings'] = ';;;'.join(warnings[row_idx]) if warnings[row_idx] else ''

    if check_similar is True:
        for val, cnt in val_counts.items():
            if cnt < MIN_SIMILAR_VALUES:

                similar_values = find_similar(value_set, val)

                if similar_values:
                    errors[0].append(
                        f'{col_name}: Possible typo for: "{val}", similar values: {similar_values}'
                    )

    print('...done')


def check_integer(col_name, errors, warnings, clean_rows, required=False, show_missing=False, range_spec=None, set_empty_on_format_error=False):
    if col_name not in SPEC:
        raise ValueError(f'{col_name} not found in col spec!')

    print(f'Checking: {col_name}', end='')
    for row_idx, row in clean_rows.items():
        val = row.get(col_name)

        if val is None or val == '':
            if required:
                errors[row_idx].append(f'{col_name}: Value cannot be empty')
            if show_missing:
                warnings[row_idx].append(f'{col_name}: Value should not be empty')

            continue

        if not re.fullmatch(r'-?\d+', val):
            if set_empty_on_format_error is True:
                row[col_name] = None
                warnings[row_idx].append(f'{col_name}: Expected whole number, got: {val}')
            else:
                errors[row_idx].append(f'{col_name}: Expected whole number, got: {val}')

            continue

        int_value = int(val)
        if range_spec:
            if not (range_spec[0] <= int_value <= range_spec[1]):
                warnings[row_idx].append(
                    f'{col_name}: Out of range expected {range_spec[0]} -> {range_spec[1]}, got: {val}')

        # set the new value
        row[col_name] = int_value

        # add errors
        row['_import_errors'] = ';;;'.join(errors[row_idx]) if errors[row_idx] else ''
        row['_import_warnings'] = ';;;'.join(warnings[row_idx]) if warnings[row_idx] else ''

    print('...done')


def check_decimal(col_name, errors, warnings, clean_rows, required=False, show_missing=False, range_spec=None, set_empty_on_format_error=False):
    if col_name not in SPEC:
        raise ValueError(f'{col_name} not found in col spec!')

    print(f'Checking: {col_name}', end='')
    for row_idx, row in clean_rows.items():
        val = row.get(col_name)

        if val is None or val == '':
            if required:
                errors[row_idx].append(f'{col_name}: Value cannot be empty')
            if show_missing:
                warnings[row_idx].append(f'{col_name}: Value should not be empty')

            continue

        if not re.fullmatch(r'-?\d+\.?\d*', val):
            if set_empty_on_format_error is True:
                row[col_name] = None
                warnings[row_idx].append(f'{col_name}: Expected decimal number, got: {val}')
            else:
                errors[row_idx].append(f'{col_name}: Expected decimal number, got: {val}')

            continue

        float_val = float(val)
        if range_spec:
            if not (range_spec[0] <= float_val <= range_spec[1]):
                warnings[row_idx].append(
                    f'{col_name}: Out of range expected {range_spec[0]} -> {range_spec[1]}, got: {val}')

        # set the new value
        row[col_name] = float_val

        # add errors
        row['_import_errors'] = ';;;'.join(errors[row_idx]) if errors[row_idx] else ''
        row['_import_warnings'] = ';;;'.join(warnings[row_idx]) if warnings[row_idx] else ''

    print('...done')


def collect_errors_and_warnings():
    check_text('Unique_Id', errors, warnings, clean_rows, required=True, unique=True, regex=r'[a-zA-Z]{2}\d{5}', min_length=7, max_length=7, set_uppercase=True)
    check_dropdown('Zone', errors, warnings, clean_rows, required=True, max_length=13, min_length=7)
    check_dropdown('Woreda', errors, warnings, clean_rows, required=True, max_length=17, min_length=4)
    check_dropdown('Tabiya', errors, warnings, clean_rows, required=True, max_length=20, min_length=3)
    check_dropdown('Kushet', errors, warnings, clean_rows, required=True, max_length=25, min_length=3)
    check_text('Site_Name', errors, warnings, clean_rows, max_length=35, min_length=2)
    check_dropdown('Scheme_Type', errors, warnings, clean_rows, required=True, max_length=3, min_length=2, set_uppercase=True)
    check_integer('Year_of_Construction', errors, warnings, clean_rows, range_spec=(1950, 2019))
    check_dropdown('Result', errors, warnings, clean_rows, max_length=10, min_length=3)
    check_dropdown('Well Use', errors, warnings, clean_rows, max_length=28, min_length=6)
    check_decimal('Depth', errors, warnings, clean_rows, range_spec=(0, 550), set_empty_on_format_error=True)
    check_decimal('Yield', errors, warnings, clean_rows, range_spec=(0, 90), set_empty_on_format_error=True)

    check_decimal('Static_Water_Level', errors, warnings, clean_rows, range_spec=(0, 170), set_empty_on_format_error=True)
    check_dropdown('Pump_Type', errors, warnings, clean_rows, max_length=11, min_length=3)
    check_dropdown('Power_Source', errors, warnings, clean_rows, max_length=9, min_length=4)
    check_dropdown('Functioning', errors, warnings, clean_rows, max_length=3, min_length=2)
    check_dropdown('Reason_of_Non_Functioning', errors, warnings, clean_rows, max_length=25, min_length=5)

    check_dropdown('Intervention_Required', errors, warnings, clean_rows, max_length=19, min_length=5)
    check_decimal('Ave_Dist_from_near_Village (km)', errors, warnings, clean_rows, range_spec=(0, 100), set_empty_on_format_error=True)

    check_integer('Beneficiaries', errors, warnings, clean_rows, range_spec=(0, 10000))
    check_integer('Femal Beneficiaries', errors, warnings, clean_rows, range_spec=(0, 10000))

    check_dropdown('Water_Committe_Exist', errors, warnings, clean_rows, max_length=3, min_length=2)
    check_dropdown('By Law (Sirit)', errors, warnings, clean_rows, max_length=3, min_length=2)
    check_dropdown('Fund_Raise', errors, warnings, clean_rows, max_length=3, min_length=2)

    check_decimal('Amount_of_Deposited_', errors, warnings, clean_rows, range_spec=(0, 300000))

    check_dropdown('Bank book', errors, warnings, clean_rows, max_length=3, min_length=2)
    check_dropdown('Fencing_Exist', errors, warnings, clean_rows, max_length=3, min_length=2)
    check_dropdown('Guard', errors, warnings, clean_rows, max_length=3, min_length=2)
    check_integer('Livestock', errors, warnings, clean_rows, range_spec=(0, 3000), set_empty_on_format_error=True)

    check_dropdown('Funded_By', errors, warnings, clean_rows, max_length=17, min_length=3)
    check_dropdown('Constructed_By', errors, warnings, clean_rows, max_length=18, min_length=3)
    check_dropdown('General_Condition', errors, warnings, clean_rows, max_length=4, min_length=4)

    check_text('Name_of_Data_Collector', errors, warnings, clean_rows, max_length=42, min_length=3)
    check_text(
        'Date_of_Data_Collection', errors, warnings, clean_rows,
        regex=r'\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}',
        max_length=19, min_length=6, check_special=False
    )
    check_text('Name_and_tel_of_Contact_Person', errors, warnings, clean_rows, max_length=35, min_length=3, check_special=False)
    check_text('Img Picture_of_Scehem', errors, warnings, clean_rows, max_length=190, min_length=169, check_special=False)

    check_decimal('Latitude', errors, warnings, clean_rows, show_missing=True, range_spec=(3, 15), set_empty_on_format_error=True)
    check_decimal('Longitude', errors, warnings, clean_rows, show_missing=True, range_spec=(32, 48), set_empty_on_format_error=True)
    check_decimal('Altitude', errors, warnings, clean_rows, range_spec=(-1, 5000), set_empty_on_format_error=True)
    check_decimal('Accuracy', errors, warnings, clean_rows, range_spec=(-10, 50), set_empty_on_format_error=True)

    # calc some stats
    total_cells = len(clean_rows) * len(SPEC)

    total_errors = sum(len(row_errors) for row_errors in errors.values())

    # pprint.pprint(errors, width=300)

    print(f'cells: {total_cells}, errors: {total_errors}, ratio: {(total_errors / total_cells) * 100:.2f}')


def write_error_report():
    with open('import_result.txt', 'w') as f:

        sorted_errors = sorted(errors.items(), key=lambda x: x[0])

        f.write('==========\nRow errors:\n==========\n\n')

        for error_row, values in sorted_errors[1:]:
            if len(values) > 0:
                f.write(f'Row - {error_row}:\n')
                for val in values:
                    f.write(f'\t{val}\n')
                f.write('\n')

        f.write('\n\n==========\nPossible spelling errors:\n==========\n\n')
        sorted_warnings = sorted(sorted_errors[0][1])
        for key, group in itertools.groupby(sorted_warnings, key=lambda x: x.split(':')[0]):
            f.write(f'Attribute - "{key}":\n')
            for err in group:
                f.write(f'\t{":".join(err.split(":")[1:])}\n')
            f.write('\n')


if __name__ == '__main__':

    workbook = openpyxl.load_workbook(path, read_only=True)
    worksheet = workbook.active

    rows = worksheet.iter_rows()

    header = [clean_value(cell.value) for cell in next(rows)]

    header_set = {col for col in header if col}
    missing_diff = SPEC.difference(header_set)
    new_cols_diff = header_set.difference(SPEC)

    if missing_diff:
        raise ValueError(f'Missing columns: {missing_diff}')
    if new_cols_diff:
        raise ValueError(f'Got new columns: {new_cols_diff}')

    clean_rows = {}

    row_num = 2
    for row in rows:
        clean_cols = {}

        for col_idx, col in enumerate(row):
            if header[col_idx] is None:
                continue
            clean_cols[header[col_idx]] = clean_value(col.value)

        # skip rows with no values
        if all(v is None for v in clean_cols.values()):
            continue

        clean_rows[row_num] = clean_cols
        row_num += 1

    errors = defaultdict(list)
    warnings = defaultdict(list)

    collect_errors_and_warnings()
    write_error_report()

    header_list = [
        "Unique_Id", "Zone", "Woreda", "Tabiya", "Kushet", "Site_Name", "Scheme_Type", "Year_of_Construction",
        "Result", "Well Use", "Depth", "Yield", "Static_Water_Level", "Pump_Type", "Power_Source", "Functioning",
        "Reason_of_Non_Functioning", "Intervention_Required", "Ave_Dist_from_near_Village (km)", "Beneficiaries",
        "Femal Beneficiaries", "Water_Committe_Exist", "By Law (Sirit)", "Fund_Raise", "Amount_of_Deposited_",
        "Bank book", "Fencing_Exist", "Guard", "Livestock", "Funded_By", "Constructed_By", "General_Condition",
        "Name_of_Data_Collector", "Date_of_Data_Collection", "Name_and_tel_of_Contact_Person", "Img Picture_of_Scehem",
        "Latitude", "Longitude", "Altitude", "Accuracy",
        "_import_errors", "_import_warnings"
    ]

    with open('clean_dataset.csv', 'w') as clean_dataset:
        writer = csv.DictWriter(clean_dataset, fieldnames=header_list)

        writer.writeheader()
        writer.writerows(clean_rows.values())

