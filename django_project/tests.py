import unittest
from importCSV_functions.functions import for_update, for_insert, check_headers, get_dataXLSX, check_data


class TestCSVImport(unittest.TestCase):

    def test_check_headers_areSame(self):
        headerXLSX = ['col1', 'col2', 'col3']
        headerDB = ['col1', 'col3', 'col2']

        self.assertFalse(check_headers(headerXLSX, headerDB)[0])


    def test_check_headers_moreInXLSX(self):
        headerXLSX = ['col1', 'col2', 'col3', 'col4']
        headerDB = ['col1', 'col3', 'col2']

        self.assertTrue(check_headers(headerXLSX, headerDB)[0])


    def test_check_headers_moreInDB(self):
        headerXLSX = ['col1', 'col2', 'col3']
        headerDB = ['col1', 'col3', 'col2', 'col4']

        self.assertFalse(check_headers(headerXLSX, headerDB)[0])
        #todo OK?


    def test_for_update_sameRows(self):
        rowXLSX = {'a': '123', 'b': 123, 'c': 'abc'}
        rowDB = {'a': '123', 'b': 123, 'c': 'abc'}

        self.assertFalse(for_update(rowXLSX, rowDB))


    def test_for_update_differentRows(self):
        rowXLSX = {'a': '123', 'b': 123, 'c': 'ab'}
        rowDB = {'a': '123', 'b': 123, 'c': 'abc'}

        self.assertTrue(for_update(rowXLSX, rowDB))


    """def test_for_update4(self):
        rowXLSX = {'a': '123', 'b': 123, 'c': 'abc', 'd': 'abc'}
        rowDB = {'a': '123', 'b': 123, 'c': 'abc'}
        
        self.assertFalse(for_update(rowXLSX, rowDB))"""


    def test_for_update_moreRowsInDB(self):
        rowXLSX = {'a': '123', 'b': 123, 'c': 'abc'}
        rowDB = {'a': '123', 'b': 123, 'c': 'abc', 'd': 'abc'}

        self.assertFalse(for_update(rowXLSX, rowDB))
        #todo OK?


    def test_for_import_inDropdown(self):
        index_row = 3
        row = {'a': 'abc'}
        attributes ={'a': {'type': 'DropDown', 'required': False, 'id': '1', 'options': ['abc', 'Eastern']}}

        self.assertTrue(for_insert(index_row, row, attributes)[0])


    def test_for_import_notInDropdown(self):
        index_row = 3
        row = {'a': 'abc1'}
        attributes = {'a': {'type': 'DropDown', 'required': False, 'id': '1', 'options': ['abc', 'Eastern']}}

        self.assertEqual(for_insert(index_row, row, attributes), (False, ['Value in column a in row 3 is not allowed. It should be one of the predefined values.']))


    def test_for_import_isInteger(self):
        index_row = 3
        row = {'a': 1}
        attributes = {'a': {'type': 'Integer', 'required': False, 'id': '1'}}

        self.assertTrue(for_insert(index_row, row, attributes)[0])


    def test_for_import_isNotInteger(self):
        index_row = 3
        row = {'a': 1.2}
        attributes = {'a': {'type': 'Integer', 'required': False, 'id': '1'}}

        self.assertEqual(for_insert(index_row, row, attributes), (False, ['Value in column a in row 3 is not allowed. It should be a whole number.']))


    def test_for_import_isDecimal(self):
        index_row = 3
        row = {'a': 1.2}
        attributes = {'a': {'type': 'Decimal', 'required': False, 'id': '1'}}

        self.assertTrue(for_insert(index_row, row, attributes)[0])


    def test_for_import_isNotDecimal2(self):
        index_row = 3
        row = {'a': '1.2'}
        attributes = {'a': {'type': 'Decimal', 'required': False, 'id': '1'}}

        self.assertEqual(for_insert(index_row, row, attributes), (False, ['Value in column a in row 3 is not allowed. It should be a decimal number.']))


    def test_for_import_required_notEmpty(self):
        index_row = 3
        row = {'a': 1.2}
        attributes = {'a': {'type': 'Decimal', 'required': True}}

        self.assertTrue(for_insert(index_row, row, attributes)[0])


    def test_for_import_required_empty(self):
        index_row = 3
        row = {'a': '', 'b': 1}
        attributes = {'a': {'type': 'Decimal', 'required': True, 'id': '1'}}

        self.assertEqual(for_insert(index_row, row, attributes), (False, ['Value in column a in row 3 is missing.']))


    def test_for_import_empty_row(self):
        index_row = 3
        row = {'a': ''}
        attributes = {'a': {'type': 'Decimal', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']}}

        self.assertEqual(for_insert(index_row, row, attributes), (False, ['Row 3 is empty.']))


    def test_getDataXLSX_noFile(self):
        self.assertEqual(get_dataXLSX('noFile'), ('', '', True, 'File with specified name could not be found.'))


    def test_getDataXLSX_emptyFile(self):
        self.assertEqual(get_dataXLSX('empty.xlsx'), ('', '', True, 'First row or entire XLSX file is empty.'))


    def test_getDataXLSX_emptyFirstRow(self):
        self.assertEqual(get_dataXLSX('empty_firstRow.xlsx'), ('', '', True, 'First row or entire XLSX file is empty.'))


    def test_getDataXLSX_columnsWithoutName(self):
        self.assertEqual(get_dataXLSX('columnsWithoutName.xlsx'), ('', '', True, 'There are columns without name.'))


    def test_check_data_no_change(self):
        dataXLSX = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        dataDB = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_insert, records_for_update, records_for_delete, errors, [update, unchanged, insert, needs_correction, delete]

        self.assertEqual(check_data(dataXLSX, dataDB, attributes), ([], [], [], [], [0, 2, 0, 0, 0]))


    def test_check_data_oneForDelete(self):
        dataXLSX = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '<delete>': {'a': 98, 'b': 'cba', 'c': 1.57}}
        dataDB = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_insert, records_for_update, records_for_delete, errors, [update, unchanged, insert, needs_correction, delete]

        self.assertEqual(check_data(dataXLSX, dataDB, attributes), ([], [], [{'a': 98, 'b': 'cba', 'c': 1.57}], [], [0, 1, 0, 0, 1]))


    def test_check_data_oneForInsert(self):
        dataXLSX = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, 'AAA': {'a': 98, 'b': 'cba', 'c': 1.57}}
        dataDB = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_insert, records_for_update, records_for_delete, errors, [update, unchanged, insert, needs_correction, delete]

        self.assertEqual(check_data(dataXLSX, dataDB, attributes), ([{'a': 98, 'b': 'cba', 'c': 1.57}], [], [], [], [0, 1, 1, 0, 0]))


    def test_check_data_oneForUpdate(self):
        dataXLSX = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.58}}
        dataDB = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_insert, records_for_update, records_for_delete, errors, [update, unchanged, insert, needs_correction, delete]

        self.assertEqual(check_data(dataXLSX, dataDB, attributes), ([], [{'a': 98, 'b': 'cba', 'c': 1.58}], [], [], [1, 1, 0, 0, 0]))


    def test_check_data_oneUpdate_oneWith3Errors(self):
        dataXLSX = {'453abc': {'a': 1234, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 1.2, 'b': 'abc', 'c': None}}
        dataDB = {'453abc': {'a': 123, 'b': 'xyz', 'c': 1.23}, '653bnj': {'a': 98, 'b': 'cba', 'c': 1.57}}
        attributes = {'a': {'type': 'Integer', 'required': True, 'id': '1'},
                      'b': {'type': 'DropDown', 'required': True, 'id': '1', 'options': ['cba', 'xyz']},
                      'c': {'type': 'Decimal', 'required': True, 'id': '1'}}
        # return records_for_insert, records_for_update, records_for_delete, errors, [update, unchanged, insert, needs_correction, delete]

        self.assertEqual(check_data(dataXLSX, dataDB, attributes), ([], [{'a': 1234, 'b': 'xyz', 'c': 1.23}], [], ['Value in column a in row 3 is not allowed. It should be a whole number.', 'Value in column b in row 3 is not allowed. It should be one of the predefined values.', 'Value in column c in row 3 is missing.'], [1, 0, 0, 1, 0]))


if __name__ == '__main__':
    unittest.main()
