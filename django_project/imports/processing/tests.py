# -*- coding: utf-8 -*-
import unittest

from functions import check_data, check_file_header, check_headers, empty_row, for_insert, for_update, get_data_file,\
    get_data_xlsx_raw


class TestCSVImport(unittest.TestCase):

    def test_get_dataxlsx_raw_noFile(self):
        self.assertRaises(ValueError, get_data_xlsx_raw, 'noFile')

    def test_get_data_xlsx_raw_no_waterpointsSheet(self):
        self.assertRaises(ValueError, get_data_xlsx_raw, 'no_waterpoints.xlsx')

    def test_get_data_xlsx_raw_19rows(self):
        data_xlsx_raw = get_data_xlsx_raw('waterpoints_test.xlsx')
        self.assertEqual(len(data_xlsx_raw), 19)

    def test_get_data_xlsx_raw_emptyFile(self):
        data_xlsx_raw = get_data_xlsx_raw('empty.xlsx')
        self.assertEqual(len(data_xlsx_raw), 0)

    def test_checkFileHeader_emptyFile(self):
        data_raw = []
        self.assertRaises(ValueError, check_file_header, data_raw)

    def test_checkFileHeader_emptyFirstRow(self):
        data_raw = [[None, None, None], ['1', '2', '3']]
        self.assertRaises(ValueError, check_file_header, data_raw)

    def test_checkFileHeader_columnsWithoutName(self):
        data_raw = [['a', None, 'b'], ['1', '2', '3']]
        self.assertRaises(ValueError, check_file_header, data_raw)

    def test_getDataFile_checkNew(self):
        data_raw = [['feature_uuid', 'a', 'b'], ['uuid1', 'x', 'y'], ['<new>', 'xy', 'yz'], ['<new>', 'ab', 'bc'],
                    ['uuid2', 'x', 'y']]
        self.assertEqual(get_data_file(data_raw), (['feature_uuid', 'a', 'b'],
                                                   {'uuid1': {'feature_uuid': 'uuid1', 'a': 'x', 'b': 'y'},
                                                    'uuid2': {'feature_uuid': 'uuid2', 'a': 'x', 'b': 'y'},
                                                    '<new>1': {'feature_uuid': '<new>', 'a': 'xy', 'b': 'yz'},
                                                    '<new>2': {'feature_uuid': '<new>', 'a': 'ab', 'b': 'bc'}}))

    def test_getDataFile_multipleUuid(self):
        data_raw = [['feature_uuid', 'a', 'b'], ['uuid1', 'x', 'y'], ['uuid1', 'xy', 'yz'], ['uuid2', 'x', 'y']]
        self.assertRaises(ValueError, get_data_file, data_raw)

    def test_getDataFile_ignoredAttributes(self):
        data_raw = [['feature_uuid', 'a', 'changeset'], ['uuid1', 'x', 'y'], ['uuid2', 'x', 'y']]
        self.assertEqual(get_data_file(data_raw), (['feature_uuid', 'a'], {'uuid1': {'feature_uuid': 'uuid1', 'a': 'x'}, 'uuid2': {'feature_uuid': 'uuid2', 'a': 'x'}}))

    def test_check_headers_areSame(self):
        header_file = ['col1', 'col2', 'col3']
        header_db = ['col1', 'col3', 'col2']
        attributes = {'col1': {'required': False}, 'col2': {'required': False}, 'col3': {'required': True}}
        self.assertEqual(check_headers(header_file, header_db, attributes), [])

    def test_check_headers_moreInFile(self):
        header_file = ['col1', 'col2', 'col3', 'col4', 'col5']
        header_db = ['col1', 'col3', 'col2']
        attributes = {'col1': {'required': False}, 'col2': {'required': False}, 'col3': {'required': True}}
        self.assertEqual(check_headers(header_file, header_db, attributes), [
            'Column "col4" in uploaded file is not defined in database. Data will be inserted in database without '
            'values in column "col4".',
            'Column "col5" in uploaded file is not defined in database. Data will be inserted in database without '
            'values in column "col5".'])

    def test_check_headers_lessInFile_notRequired(self):
        header_file = ['col1', 'col2', 'col3']
        header_db = ['col1', 'col3', 'col2', 'col4']
        attributes = {'col1': {'required': False}, 'col2': {'required': False}, 'col3': {'required': True}}
        self.assertEqual(check_headers(header_file, header_db, attributes), [])

    def test_check_headers_lessInFile_required_one(self):
        header_file = ['col1', 'col2']
        header_db = ['col1', 'col3', 'col2', 'col4']
        attributes = {'col1': {'required': False}, 'col2': {'required': False}, 'col3': {'required': True}}
        self.assertRaises(ValueError, check_headers, header_file, header_db, attributes)

    def test_check_headers_lessInFile_required_two(self):
        header_file = ['col1']
        header_db = ['col1', 'col3', 'col2', 'col4']
        attributes = {'col1': {'required': False}, 'col2': {'required': True}, 'col3': {'required': True}}
        self.assertRaises(ValueError, check_headers, header_file, header_db, attributes)

    def test_check_headers_lessInFile_required_three(self):
        header_file = ['col1']
        header_db = ['col1', 'col3', 'col2', 'col4']
        attributes = {'col1': {'required': False}, 'col2': {'required': True}, 'col3': {'required': True},
                      'col4': {'required': True}}
        self.assertRaises(ValueError, check_headers, header_file, header_db, attributes)

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
        self.assertEqual(for_insert(index_row, row, attributes), (
            False, 'Row 3: value in column "a" is not allowed (it should be one of the predefined values).'))

    def test_for_insert_isInteger(self):
        index_row = 3
        row = {'a': 1}
        attributes = {'a': {'type': 'Integer', 'required': False, 'id': '1'}}
        self.assertEqual(for_insert(index_row, row, attributes), (True, ''))

    def test_for_insert_isNotInteger(self):
        index_row = 3
        row = {'a': 1.2}
        attributes = {'a': {'type': 'Integer', 'required': False, 'id': '1'}}
        self.assertEqual(for_insert(index_row, row, attributes),
                         (False, 'Row 3: value in column "a" is not allowed (it should be a whole number).'))

    def test_for_insert_isDecimal(self):
        index_row = 3
        row = {'a': 1.2}
        attributes = {'a': {'type': 'Decimal', 'required': False, 'id': '1'}}
        self.assertEqual(for_insert(index_row, row, attributes), (True, ''))

    def test_for_insert_isNotDecimal(self):
        index_row = 3
        row = {'a': '1.2'}
        attributes = {'a': {'type': 'Decimal', 'required': False, 'id': '1'}}
        self.assertEqual(for_insert(index_row, row, attributes),
                         (False, 'Row 3: value in column "a" is not allowed (it should be a decimal number).'))

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
        self.assertEqual(for_insert(index_row, row, attributes),
                         (False, 'Row 3: value in column "a" is missing, value in column "b" is not allowed (it should '
                                 'be a decimal number), value in column "c" is not allowed (it should be one of the '
                                 'predefined values).'))

    def test_check_data_no_change(self):
        data_file = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        self.assertEqual(check_data(data_file, data_db, attributes), ([], [], [], [],
                                                                      {'num_add': 0, 'num_discarded': 0,
                                                                       'num_needs_correction': 0,
                                                                       'num_unchanged': 2, 'num_update': 0}))

    def test_check_data_oneForAdd(self):
        data_file = {'453abc': {'a': 123, 'b': 'abc', 'c': 1.23}, '<new>1': {'a': 98, 'b': 'abc', 'c': 1.57}}
        data_db = {'453abc': {'a': 123, 'b': 'abc', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'abc', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        self.assertEqual(check_data(data_file, data_db, attributes),
                         ([{'a': 98, 'b': 'abc', 'c': 1.57}], [], [], [],
                          {'num_add': 1, 'num_discarded': 0, 'num_needs_correction': 0, 'num_unchanged': 1,
                           'num_update': 0}))

    def test_check_data_oneForUpdate(self):
        data_file = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.58}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        self.assertEqual(check_data(data_file, data_db, attributes),
                         ([], [{'a': 98, 'b': 'cba', 'c': 1.58}], [], [], {'num_add': 0, 'num_discarded': 0,
                                                                           'num_needs_correction': 0,
                                                                           'num_unchanged': 1, 'num_update': 1}))

    def test_check_data_oneDiscarded(self):
        data_file = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, 'AAA': {'a': 98, 'b': 'cba', 'c': 1.57}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        self.assertEqual(check_data(data_file, data_db, attributes), (
            [], [], [], ['Row 3 was discarded. (feature_uuid not in database or not <new>)'],
            {'num_add': 0, 'num_discarded': 1, 'num_needs_correction': 0, 'num_unchanged': 1, 'num_update': 0}))

    def test_check_data_oneUpdate_oneWith3Errors_oneDiscarded_oneForAdd(self):
        data_file = {'453abc': {'a': 1234, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 1.2, 'b': 'abc', 'c': None},
                     'ABC': {'a': 98, 'b': 'xyz', 'c': 1.2}, '<new>1': {'a': 98, 'b': 'cba', 'c': 1.2}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        self.assertEqual(check_data(data_file, data_db, attributes), (
            [{'a': 98, 'b': 'cba', 'c': 1.2}], [{'a': 1234, 'b': 'xyz', 'c': 1.23}], [], [
                'Row 3: value in column "a" is not allowed (it should be a whole number), value in column "b" is not '
                'allowed (it should be one of the predefined values), value in column "c" is missing.',
                'Row 4 was discarded. (feature_uuid not in database or not <new>)'],
            {'num_add': 1, 'num_discarded': 1, 'num_needs_correction': 1, 'num_unchanged': 0, 'num_update': 1}))

    def test_check_data_oneForAddWithError(self):
        data_file = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '<new>1': {'a': 1.2, 'b': 'cba', 'c': 2}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        self.assertEqual(check_data(data_file, data_db, attributes), (
            [], [], [], ['Row 3: value in column "a" is not allowed (it should be a whole number).'],
            {'num_add': 0, 'num_discarded': 0, 'num_needs_correction': 1, 'num_unchanged': 1, 'num_update': 0}))

    def test_check_data_twoForAdd_noError(self):
        data_file = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '<new>1': {'a': 1, 'b': 'cba', 'c': 2},
                     '<new>2': {'a': 2, 'b': 'xyz', 'c': 2}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        self.assertEqual(check_data(data_file, data_db, attributes),
                         ([{'a': 1, 'b': 'cba', 'c': 2}, {'a': 2, 'b': 'xyz', 'c': 2}], [], [], [],
                          {'num_add': 2, 'num_discarded': 0, 'num_needs_correction': 0, 'num_unchanged': 1,
                           'num_update': 0}))

    def test_check_data_twoForAdd_withError(self):
        data_file = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '<new>1': {'a': 2, 'b': 'xyz', 'c': 2},
                     '<new>2': {'a': 1, 'b': 'aaa', 'c': 2}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        self.assertEqual(check_data(data_file, data_db, attributes),
                         ([{'a': 2, 'b': 'xyz', 'c': 2}], [], [],
                          ['Row 4: value in column "b" is not allowed (it should be one of the predefined values).'],
                          {'num_add': 1, 'num_discarded': 0, 'num_needs_correction': 1, 'num_unchanged': 1,
                           'num_update': 0}))

    def test_data_three_discarded(self):
        data_file = {'a': {'a': 123, 'b': 'xyz', 'c': 1.23}, 'b': {'a': 2, 'b': 'xyz', 'c': 2},
                     'c': {'a': 1, 'b': 'aaa', 'c': 2}}
        data_db = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        self.assertEqual(check_data(data_file, data_db, attributes), (
            [], [], [], ['Rows 2, 3 and 4 were discarded. (feature_uuid not in database or not <new>)'],
            {'num_add': 0, 'num_discarded': 3, 'num_needs_correction': 0, 'num_unchanged': 0, 'num_update': 0}))


if __name__ == '__main__':
    unittest.main()
