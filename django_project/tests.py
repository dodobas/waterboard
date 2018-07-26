import unittest
from importXLSX_functions.functions import for_update, for_insert, check_headers, get_dataXLSX_raw, get_dataXLSX, check_data


class TestCSVImport(unittest.TestCase):

    def test_get_dataXLSX_raw_noFile(self):
        self.assertEqual(get_dataXLSX_raw('noFile'), (True, 'File with specified name could not be found.'))


    def test_get_dataXLSX_raw_no_waterpointsSheet(self):
        self.assertEqual(get_dataXLSX_raw('no_waterpoints.xlsx'), (True, 'There isn\'t "waterpoints" sheet in XLSX file.'))


    def test_get_dataXLSX_raw_19rows(self):
        boolean, dataXLSX_raw = get_dataXLSX_raw('waterpoints_test.xlsx')
        self.assertEqual((boolean, len(dataXLSX_raw)), (False, 19))


    def test_get_dataXLSX_raw_emptyFile(self):
        boolean, dataXLSX_raw = get_dataXLSX_raw('empty.xlsx')
        self.assertEqual((boolean, len(dataXLSX_raw)), (False, 0))


    def test_getDataXLSX_emptyFile(self):
        dataXLSX_raw = []
        self.assertEqual(get_dataXLSX(dataXLSX_raw), (None, None, True, 'Entire XLSX file is empty.'))


    def test_getDataXLSX_emptyFirstRow(self):
        dataXLSX_raw = [[None, None, None], ['1', '2', '3']]
        self.assertEqual(get_dataXLSX(dataXLSX_raw), (None, None, True, 'First row or entire XLSX file is empty.'))


    def test_getDataXLSX_columnsWithoutName(self):
        dataXLSX_raw = [['a', None, 'b'], ['1', '2', '3']]
        self.assertEqual(get_dataXLSX(dataXLSX_raw), (None, None, True, 'There are columns without name.'))


    def test_getDataXLSX_checkNew(self):
        dataXLSX_raw = [['feature_uuid', 'a', 'b'], ['uuid1', 'x', 'y'], ['<new>', 'xy', 'yz'], ['<new>', 'ab', 'bc'], ['uuid2', 'x', 'y']]
        self.assertEqual(get_dataXLSX(dataXLSX_raw), (['feature_uuid', 'a', 'b'], {'uuid1': {'feature_uuid': 'uuid1', 'a': 'x', 'b': 'y'}, 'uuid2': {'feature_uuid': 'uuid2', 'a': 'x', 'b': 'y'}, '<new>1': {'feature_uuid': '<new>', 'a': 'xy', 'b': 'yz'}, '<new>2': {'feature_uuid': '<new>', 'a': 'ab', 'b': 'bc'}}, False, ''))


    def test_check_headers_areSame(self):
        headerXLSX = ['col1', 'col2', 'col3']
        headerDB = ['col1', 'col3', 'col2']
        attributes = {'col1': {'required': False}, 'col2': {'required': False}, 'col3': {'required': True}}

        self.assertEqual(check_headers(headerXLSX, headerDB, attributes), (False, []))


    def test_check_headers_moreInXLSX(self):
        headerXLSX = ['col1', 'col2', 'col3', 'col4', 'col5']
        headerDB = ['col1', 'col3', 'col2']
        attributes = {'col1': {'required': False}, 'col2': {'required': False}, 'col3': {'required': True}}

        self.assertEqual(check_headers(headerXLSX, headerDB, attributes), (False, ['Column "col4" in XLSX file is not defined in database.', 'Column "col5" in XLSX file is not defined in database.']))


    def test_check_headers_lessInXLSX_notRequired(self):
        headerXLSX = ['col1', 'col2', 'col3']
        headerDB = ['col1', 'col3', 'col2', 'col4']
        attributes = {'col1': {'required': False}, 'col2': {'required': False}, 'col3': {'required': True}}

        self.assertEqual(check_headers(headerXLSX, headerDB, attributes), (False, []))

    def test_check_headers_lessInXLSX_required(self):
        headerXLSX = ['col1', 'col2']
        headerDB = ['col1', 'col3', 'col2', 'col4']
        attributes = {'col1': {'required': False}, 'col2': {'required': False}, 'col3': {'required': True}}

        self.assertEqual(check_headers(headerXLSX, headerDB, attributes), (True, 'There is no required colum "col3" in XLSX file.'))


    def test_for_update_sameRows(self):
        rowXLSX = {'a': '123', 'b': 123, 'c': 'abc'}
        rowDB = {'a': '123', 'b': 123, 'c': 'abc'}

        self.assertFalse(for_update(rowXLSX, rowDB))


    def test_for_update_differentRows(self):
        rowXLSX = {'a': '123', 'b': 123, 'c': 'ab'}
        rowDB = {'a': '123', 'b': 123, 'c': 'abc'}

        self.assertTrue(for_update(rowXLSX, rowDB))


    def test_for_update_moreRowsInXLSX(self):
        rowXLSX = {'a': '123', 'b': 123, 'c': 'abc', 'd': 'abc'}
        rowDB = {'a': '123', 'b': 123, 'c': 'abc'}

        self.assertFalse(for_update(rowXLSX, rowDB))


    def test_for_update_moreRowsInDB(self):
        rowXLSX = {'a': '123', 'b': 123, 'c': 'abc'}
        rowDB = {'a': '123', 'b': 123, 'c': 'abc', 'd': 'abc'}

        self.assertFalse(for_update(rowXLSX, rowDB))


    def test_for_insert_inDropdown(self):
        index_row = 3
        row = {'a': 'abc'}
        attributes ={'a': {'type': 'DropDown', 'required': False, 'id': '1', 'options': ['abc', 'Eastern']}}

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


    def test_for_insert_emptyRow(self):
        index_row = 3
        row = {'a': None}
        attributes = {'a': {'type': 'Decimal', 'required': True}}

        self.assertEqual(for_insert(index_row, row, attributes), (False, 'Row 3 is empty.'))


    def test_for_insert_multipleErrors(self):
        index_row = 3
        row = {'a': None, 'b': 'abc', 'c': 'x'}
        attributes = {'a': {'type': 'Decimal', 'required': True},
                      'b': {'type': 'Decimal', 'required': True},
                      'c': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']}}

        self.assertEqual(for_insert(index_row, row, attributes), (False, 'Row 3: value in column "a" is missing, value in column "b" is not allowed (it should be a decimal number), value in column "c" is not allowed (it should be one of the predefined values).'))


    def test_check_data_no_change(self):
        dataXLSX = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        dataDB = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]                                                                    needs_correction]
        self.assertEqual(check_data(dataXLSX, dataDB, attributes), ([], [], [], [], [0, 0, 0, 2, 0]))


    def test_check_data_oneForAdd(self):
        dataXLSX = {'453abc': {'a': 123, 'b': 'abc', 'c': 1.23}, '<new>1': {'a': 98, 'b': 'abc', 'c': 1.57}}
        dataDB = {'453abc': {'a': 123, 'b': 'abc', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'abc', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(dataXLSX, dataDB, attributes), ([{'a': 98, 'b': 'abc', 'c': 1.57}], [], [], [], [1, 0, 0, 1, 0]))


    def test_check_data_oneForUpdate(self):
        dataXLSX = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.58}}
        dataDB = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(dataXLSX, dataDB, attributes), ([], [{'a': 98, 'b': 'cba', 'c': 1.58}], [], [], [0, 1, 0, 1, 0]))


    def test_check_data_oneDiscarded(self):
        dataXLSX = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, 'AAA': {'a': 98, 'b': 'cba', 'c': 1.57}}
        dataDB = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(dataXLSX, dataDB, attributes), ([], [], [{'a': 98, 'b': 'cba', 'c': 1.57}], [], [0, 0, 1, 1, 0]))


    def test_check_data_oneUpdate_oneWith3Errors_oneDiscarded_oneForAdd(self):
        dataXLSX = {'453abc': {'a': 1234, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 1.2, 'b': 'abc', 'c': None}, 'ABC': {'a': 98, 'b': 'xyz', 'c': 1.2}, '<new>1': {'a': 98, 'b': 'cba', 'c': 1.2}}
        dataDB = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(dataXLSX, dataDB, attributes), ([{'a': 98, 'b': 'cba', 'c': 1.2}], [{'a': 1234, 'b': 'xyz', 'c': 1.23}], [{'a': 98, 'b': 'xyz', 'c': 1.2}], ['Row 3: value in column "a" is not allowed (it should be a whole number), value in column "b" is not allowed (it should be one of the predefined values), value in column "c" is missing.'], [1, 1, 1, 0, 1]))


    def test_check_data_oneForAddWithError(self):
        dataXLSX = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '<new>1': {'a': 1.2, 'b': 'cba', 'c': 2}}
        dataDB = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(dataXLSX, dataDB, attributes), ([], [], [], ['Row 3: value in column "a" is not allowed (it should be a whole number).'], [0, 0, 0, 1, 1]))

    def test_check_data_twoForAdd_noError(self):
        dataXLSX = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '<new>1': {'a': 1, 'b': 'cba', 'c': 2}, '<new>2': {'a': 2, 'b': 'xyz', 'c': 2}}
        dataDB = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(dataXLSX, dataDB, attributes), ([{'a': 1, 'b': 'cba', 'c': 2}, {'a': 2, 'b': 'xyz', 'c': 2}], [], [], [], [2, 0, 0, 1, 0]))

    def test_check_twoForAdd_withError(self):
        dataXLSX = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '<new>1': {'a': 2, 'b': 'xyz', 'c': 2}, '<new>2': {'a': 1, 'b': 'aaa', 'c': 2}}
        dataDB = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_add, records_for_update, discarded_records, errors, [add, update, discarded, unchanged, needs_correction]
        self.assertEqual(check_data(dataXLSX, dataDB, attributes), ([{'a': 2, 'b': 'xyz', 'c': 2}], [], [], ['Row 4: value in column "b" is not allowed (it should be one of the predefined values).'], [1, 0, 0, 1, 1]))



if __name__ == '__main__':
    unittest.main()
