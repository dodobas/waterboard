# -*- coding: utf-8 -*-
import unittest
from functions import for_update, for_insert, check_headers, get_data_xlsx_raw, get_data_file, check_data, empty_row


class TestCSVImport(unittest.TestCase):

    def test_get_dataxlsx_raw_noFile(self):
        self.assertRaises(FileNotFoundError, get_data_xlsx_raw, 'noFile')

    def test_get_data_xlsx_raw_no_waterpointsSheet(self):
        self.assertRaises(KeyError, get_data_xlsx_raw, 'no_waterpoints.xlsx')

    def test_get_data_xlsx_raw_19rows(self):
        data_xlsx_raw = get_data_xlsx_raw('waterpoints_test.xlsx')
        self.assertEqual(len(data_xlsx_raw), 19)

    def test_get_data_xlsx_raw_emptyFile(self):
        data_xlsx_raw = get_data_xlsx_raw('empty.xlsx')
        self.assertEqual(len(data_xlsx_raw), 0)

    def test_getDataFile_emptyFile(self):
        data_xlsx_raw = []
        self.assertRaises(IndexError, get_data_file, data_xlsx_raw)

    def test_getDataFile_emptyFirstRow(self):
        data_xlsx_raw = [[None, None, None], ['1', '2', '3']]
        self.assertRaises(LookupError, get_data_file, data_xlsx_raw)

    def test_getDataFile_columnsWithoutName(self):
        data_xlsx_raw = [['a', None, 'b'], ['1', '2', '3']]
        self.assertRaises(LookupError, get_data_file, data_xlsx_raw)

    def test_getDataFile_checkNew(self):
        dataxlsx_raw = [['feature_uuid', 'a', 'b'], ['uuid1', 'x', 'y'], ['<new>', 'xy', 'yz'], ['<new>', 'ab', 'bc'], ['uuid2', 'x', 'y']]
        self.assertEqual(get_data_file(dataxlsx_raw), (['feature_uuid', 'a', 'b'], {'uuid1': {'feature_uuid': 'uuid1', 'a': 'x', 'b': 'y'}, 'uuid2': {'feature_uuid': 'uuid2', 'a': 'x', 'b': 'y'}, '<new>1': {'feature_uuid': '<new>', 'a': 'xy', 'b': 'yz'}, '<new>2': {'feature_uuid': '<new>', 'a': 'ab', 'b': 'bc'}}))

    def test_getDataFile_MultipleUuid(self):
        dataxlsx_raw = [['feature_uuid', 'a', 'b'], ['uuid1', 'x', 'y'], ['uuid1', 'xy', 'yz'], ['uuid2', 'x', 'y']]
        self.assertRaises(KeyError, get_data_file, dataxlsx_raw)

    def test_check_headers_areSame(self):
        header_file = ['col1', 'col2', 'col3']
        header_db = ['col1', 'col3', 'col2']
        attributes = {'col1': {'required': False}, 'col2': {'required': False}, 'col3': {'required': True}}
        self.assertEqual(check_headers(header_file, header_db, attributes), [])

    def test_check_headers_moreInFile(self):
        header_file = ['col1', 'col2', 'col3', 'col4', 'col5']
        header_db = ['col1', 'col3', 'col2']
        attributes = {'col1': {'required': False}, 'col2': {'required': False}, 'col3': {'required': True}}
        self.assertEqual(check_headers(header_file, header_db, attributes), ['Column "col4" in uploaded file is not defined in database. Data will be inserted in database without values in column "col4".', 'Column "col5" in uploaded file is not defined in database. Data will be inserted in database without values in column "col5".'])

    def test_check_headers_lessInFile_notRequired(self):
        header_file = ['col1', 'col2', 'col3']
        header_db = ['col1', 'col3', 'col2', 'col4']
        attributes = {'col1': {'required': False}, 'col2': {'required': False}, 'col3': {'required': True}}
        self.assertEqual(check_headers(header_file, header_db, attributes), [])

    def test_check_headers_lessInFile_required_one(self):
        header_file = ['col1', 'col2']
        header_db = ['col1', 'col3', 'col2', 'col4']
        attributes = {'col1': {'required': False}, 'col2': {'required': False}, 'col3': {'required': True}}
        self.assertRaises(LookupError, check_headers, header_file, header_db, attributes)

    def test_check_headers_lessInFile_required_two(self):
        header_file = ['col1']
        header_db = ['col1', 'col3', 'col2', 'col4']
        attributes = {'col1': {'required': False}, 'col2': {'required': True}, 'col3': {'required': True}}
        self.assertRaises(LookupError, check_headers, header_file, header_db, attributes)

    def test_check_headers_lessInFile_required_three(self):
        header_file = ['col1']
        header_db = ['col1', 'col3', 'col2', 'col4']
        attributes = {'col1': {'required': False}, 'col2': {'required': True}, 'col3': {'required': True}, 'col4': {'required': True}}
        self.assertRaises(LookupError, check_headers, header_file, header_db, attributes)

    def test_empty_row(self):
        row = {'a': None, 'b': None, 'c': None}
        self.assertTrue(empty_row(row))

    def test_for_update_sameRows(self):
        row_file = {'a': '123', 'b': 123, 'c': 'abc'}
        row_db = {'a': '123', 'b': 123, 'c': 'abc'}
        self.assertFalse(for_update(row_file, row_db))

    def test_for_update_differentRows(self):
        row_file = {'a': '123', 'b': 123, 'c': 'ab'}
        row_db = {'a': '123', 'b': 123, 'c': 'abc'}
        self.assertTrue(for_update(row_file, row_db))

    def test_for_update_moreRowsInFile(self):
        row_file = {'a': '123', 'b': 123, 'c': 'abc', 'd': 'abc'}
        row_db = {'a': '123', 'b': 123, 'c': 'abc'}
        self.assertFalse(for_update(row_file, row_db))

    def test_for_update_moreRowsInDB(self):
        row_file = {'a': '123', 'b': 123, 'c': 'abc'}
        row_db = {'a': '123', 'b': 123, 'c': 'abc', 'd': 'abc'}
        self.assertFalse(for_update(row_file, row_db))

    def test_for_insert_inDropdown(self):
        index_row = 3
        row = {'a': 'abc'}
        attributes = {'a': {'type': 'DropDown', 'required': False, 'id': '1', 'options': ['abc', 'Eastern']}}
        self.assertEqual(for_insert(index_row, row, attributes), (True, ''))

    def test_for_insert_notInDropdown(self):
        index_row = 3
        row = {'a': 'abc1'}
        attributes = {'a': {'type': 'DropDown', 'required': False, 'id': '1', 'options': ['abc', 'Eastern']}}
        self.assertEqual(for_insert(index_row, row, attributes), (False, 'Row 3: value in column "a" is not allowed (it should be one of the predefined values).'))

    def test_for_insert_isInteger(self):
        index_row = 3
        row = {'a': 1}
        attributes = {'a': {'type': 'Integer', 'required': False, 'id': '1'}}
        self.assertEqual(for_insert(index_row, row, attributes), (True, ''))

    def test_for_insert_isNotInteger(self):
        index_row = 3
        row = {'a': 1.2}
        attributes = {'a': {'type': 'Integer', 'required': False, 'id': '1'}}
        self.assertEqual(for_insert(index_row, row, attributes), (False, 'Row 3: value in column "a" is not allowed (it should be a whole number).'))

    def test_for_insert_isDecimal(self):
        index_row = 3
        row = {'a': 1.2}
        attributes = {'a': {'type': 'Decimal', 'required': False, 'id': '1'}}
        self.assertEqual(for_insert(index_row, row, attributes), (True, ''))

    def test_for_insert_isNotDecimal(self):
        index_row = 3
        row = {'a': '1.2'}
        attributes = {'a': {'type': 'Decimal', 'required': False, 'id': '1'}}
        self.assertEqual(for_insert(index_row, row, attributes), (False, 'Row 3: value in column "a" is not allowed (it should be a decimal number).'))

    def test_for_insert_required_notEmpty(self):
        index_row = 3
        row = {'a': 1.2}
        attributes = {'a': {'type': 'Decimal', 'required': True}}
        self.assertEqual(for_insert(index_row, row, attributes), (True, ''))

    def test_for_insert_required_empty(self):
        index_row = 3
        row = {'a': None, 'b': 1}
        attributes = {'a': {'type': 'Decimal', 'required': True, 'id': '1'}}
        self.assertEqual(for_insert(index_row, row, attributes), (False, 'Row 3: value in column "a" is missing.'))

    def test_for_insert_multipleErrors(self):
        index_row = 3
        row = {'a': None, 'b': 'abc', 'c': 'x'}
        attributes = {'a': {'type': 'Decimal', 'required': True},
                      'b': {'type': 'Decimal', 'required': True},
                      'c': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']}}
        self.assertEqual(for_insert(index_row, row, attributes), (False, 'Row 3: value in column "a" is missing, value in column "b" is not allowed (it should be a decimal number), value in column "c" is not allowed (it should be one of the predefined values).'))

    def test_check_data_no_change(self):
        data_file = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]                                                                    needs_correction]
        self.assertEqual(check_data(data_file, data_db, attributes), ([], [], '', [], [0, 0, 0, 2, 0]))

    def test_check_data_oneForAdd(self):
        data_file = {'453abc': {'a': 123, 'b': 'abc', 'c': 1.23}, '<new>1': {'a': 98, 'b': 'abc', 'c': 1.57}}
        data_db = {'453abc': {'a': 123, 'b': 'abc', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'abc', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(data_file, data_db, attributes), ([{'a': 98, 'b': 'abc', 'c': 1.57}], [], '', [], [1, 0, 0, 1, 0]))

    def test_check_data_oneForUpdate(self):
        data_file = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.58}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(data_file, data_db, attributes), ([], [{'a': 98, 'b': 'cba', 'c': 1.58}], '', [], [0, 1, 0, 1, 0]))

    def test_check_data_oneDiscarded(self):
        data_file = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, 'AAA': {'a': 98, 'b': 'cba', 'c': 1.57}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(data_file, data_db, attributes), ([], [], 'Row 3 has been discarded. (feature_uuid not in database or not <new>)', [], [0, 0, 1, 1, 0]))

    def test_check_data_oneUpdate_oneWith3Errors_oneDiscarded_oneForAdd(self):
        data_file = {'453abc': {'a': 1234, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 1.2, 'b': 'abc', 'c': None}, 'ABC': {'a': 98, 'b': 'xyz', 'c': 1.2}, '<new>1': {'a': 98, 'b': 'cba', 'c': 1.2}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(data_file, data_db, attributes), ([{'a': 98, 'b': 'cba', 'c': 1.2}], [{'a': 1234, 'b': 'xyz', 'c': 1.23}], 'Row 4 has been discarded. (feature_uuid not in database or not <new>)', ['Row 3: value in column "a" is not allowed (it should be a whole number), value in column "b" is not allowed (it should be one of the predefined values), value in column "c" is missing.'], [1, 1, 1, 0, 1]))

    def test_check_data_oneForAddWithError(self):
        data_file = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '<new>1': {'a': 1.2, 'b': 'cba', 'c': 2}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(data_file, data_db, attributes), ([], [], '', ['Row 3: value in column "a" is not allowed (it should be a whole number).'], [0, 0, 0, 1, 1]))

    def test_check_data_twoForAdd_noError(self):
        data_file = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '<new>1': {'a': 1, 'b': 'cba', 'c': 2}, '<new>2': {'a': 2, 'b': 'xyz', 'c': 2}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(data_file, data_db, attributes), ([{'a': 1, 'b': 'cba', 'c': 2}, {'a': 2, 'b': 'xyz', 'c': 2}], [], '', [], [2, 0, 0, 1, 0]))

    def test_check_data_twoForAdd_withError(self):
        data_file = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '<new>1': {'a': 2, 'b': 'xyz', 'c': 2}, '<new>2': {'a': 1, 'b': 'aaa', 'c': 2}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(data_file, data_db, attributes), ([{'a': 2, 'b': 'xyz', 'c': 2}], [], '', ['Row 4: value in column "b" is not allowed (it should be one of the predefined values).'], [1, 0, 0, 1, 1]))

    def test_data_three_discarded(self):
        data_file = {'a': {'a': 123, 'b': 'xyz', 'c': 1.23}, 'b': {'a': 2, 'b': 'xyz', 'c': 2}, 'c': {'a': 1, 'b': 'aaa', 'c': 2}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(data_file, data_db, attributes), ([], [], 'Rows 2, 3 and 4 have been discarded. (feature_uuid not in database or not <new>)', [], [0, 0, 3, 0, 0]))


if __name__ == '__main__':
    unittest.main()