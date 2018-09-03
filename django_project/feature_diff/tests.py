# -*- coding: utf-8 -*-
import unittest

from .utils import find_differences, get_metadata, integrate_data


class TestUtils(unittest.TestCase):

    def test_integrate_data(self):
        changeset1 = {'attr1': 123, 'attr3': '123', 'attr2': 'abc'}
        changeset2 = {'attr3': '456', 'attr2': 'def', 'attr1': 456}
        attributes_dict = {'attr1': 'Attr 1', 'attr3': 'Attr 3'}

        expected_result = {
            'Attr 1': {'changeset1_value': 123, 'changeset2_value': 456},
            'Attr 3': {'changeset1_value': '123', 'changeset2_value': '456'}
        }

        self.assertEqual(integrate_data(changeset1, changeset2, attributes_dict), expected_result)


    def test_find_differences(self):
        table = {
            'Attr 1': {'changeset1_value': 123, 'changeset2_value': 456},
            'Attr 2': {'changeset1_value': 'abc', 'changeset2_value': 'abc'},
            'Attr 3': {'changeset1_value': '123', 'changeset2_value': '456'}
        }

        self.assertEqual(find_differences(table), ['Attr 1', 'Attr 3'])


    def test_get_metadata(self):
        changeset = {'attr1': 123, 'attr3': '123', 'attr2': 'abc', 'email': 'me@example.com', '_created_date': '01-01-2016'}

        self.assertEqual(get_metadata(changeset), {'email': 'me@example.com', 'ts': '01-01-2016'})
