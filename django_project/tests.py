import unittest
from importCSV import funkcija
from importCSV_functions.functions import for_update, for_insert, check_headers, get_dataDB, get_dataXLSX
import datetime
from dateutil.tz import tzutc

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


    def test_for_import_inDropdown(self):
        indr = 3
        row = {'a': 'abc'}
        attributes ={'a': {'type': 'DropDown', 'required': False, 'id': '1', 'options': ['abc', 'Eastern']}}

        self.assertTrue(for_insert(indr, row, attributes)[0])


    def test_for_import_notInDropdown(self):
        indr = 3
        row = {'a': 'abc1'}
        attributes = {'a': {'type': 'DropDown', 'required': False, 'id': '1', 'options': ['abc', 'Eastern']}}

        self.assertFalse(for_insert(indr, row, attributes)[0])


    def test_for_import_isInteger(self):
        indr = 3
        row = {'a': 1}
        attributes = {'a': {'type': 'Integer', 'required': False, 'id': '1', 'options': ['abc', 'Eastern']}}

        self.assertTrue(for_insert(indr, row, attributes)[0])


    def test_for_import_isNotInteger(self):
        indr = 3
        row = {'a': 1.2}
        attributes = {'a': {'type': 'Integer', 'required': False, 'id': '1', 'options': ['abc', 'Eastern']}}

        self.assertFalse(for_insert(indr, row, attributes)[0])


    def test_for_import_isDecimal(self):
        indr = 3
        row = {'a': 1.2}
        attributes = {'a': {'type': 'Decimal', 'required': False, 'id': '1', 'options': ['abc', 'Eastern']}}

        self.assertTrue(for_insert(indr, row, attributes)[0])


    def test_for_import_isNotDecimal2(self):
        indr = 3
        row = {'a': '1.2'}
        attributes = {'a': {'type': 'Decimal', 'required': False, 'id': '1', 'options': ['abc', 'Eastern']}}

        self.assertFalse(for_insert(indr, row, attributes)[0])


    def test_for_import_required_notEmpty(self):
        indr = 3
        row = {'a': 1.2}
        attributes = {'a': {'type': 'Decimal', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']}}

        self.assertTrue(for_insert(indr, row, attributes)[0])


    def test_for_import_required_empty(self):
        indr = 3
        row = {'a': ''}
        attributes = {'a': {'type': 'Decimal', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']}}

        self.assertFalse(for_insert(indr, row, attributes)[0])

    def test_for_import_required2_xxx(self):
        indr = None
        row = None
        attributes = {'a': {'type': 'Decimal', 'required': True, 'id': '1', 'options': ['abc', 'Eastern']}}

        self.assertFalse(for_insert(indr, row, attributes)[0])
if __name__ == '__main__':
    unittest.main()
