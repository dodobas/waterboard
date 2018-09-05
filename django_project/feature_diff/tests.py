# -*- coding: utf-8 -*-
import unittest

from .utils import find_differences, get_metadata, integrate_data


class TestUtils(unittest.TestCase):

    def test_integrate_data(self):
        changeset1 = {'attr1': 123, 'attr3': '123', 'attr2': 'abc', 'attr4': '123', 'attr5': '28'}
        changeset2 = {'attr3': '456', 'attr2': 'def', 'attr1': 456, 'attr4': 28, 'attr5': '28'}
        attributes = [
            {'group_label': 'group1', 'label': 'Attr 1', 'key': 'attr1'},
            {'group_label': 'group1', 'label': 'Attr 2', 'key': 'attr2'},
            {'group_label': 'group2', 'label': 'Attr 4', 'key': 'attr4'},
            {'group_label': 'group3', 'label': 'Attr 5', 'key': 'attr5'}
        ]

        expected_result = [
            'group1', {'label': 'Attr 1', 'changeset1_value': 123, 'changeset2_value': 456},
            {'label': 'Attr 2', 'changeset1_value': 'abc', 'changeset2_value': 'def'},
            'group2', {'label': 'Attr 4', 'changeset1_value': '123', 'changeset2_value': 28}, 'group3',
            {'label': 'Attr 5', 'changeset1_value': '28', 'changeset2_value': '28'}
        ]

        self.assertEqual(integrate_data(changeset1, changeset2, attributes), expected_result)

    def test_find_differences(self):
        table = [
            'group1', {'label': 'Attr 1', 'changeset1_value': 123, 'changeset2_value': 123},
            {'label': 'Attr 2', 'changeset1_value': 'abc', 'changeset2_value': 'def'},
            'group2', {'label': 'Attr 4', 'changeset1_value': '123', 'changeset2_value': 28}, 'group3',
            {'label': 'Attr 5', 'changeset1_value': '28', 'changeset2_value': 28}
        ]

        self.assertEqual(find_differences(table), ['Attr 2', 'Attr 4', 'Attr 5'])

    def test_get_metadata_middle(self):
        changeset = {
            'attr1': 123, 'attr3': '123', 'attr2': 'abc', 'email': 'me@example.com',
            '_created_date': '2016-01-02T23:30:00+00:00'
        }
        changeset_id = 4
        available_changeset_ids = [7, 6, 5, 4, 3, 2, 1]

        self.assertEqual(
            get_metadata(changeset, changeset_id, available_changeset_ids),
            {'email': 'me@example.com', 'ts': '2016-01-02 23:30:00 UTC', 'next': 5, 'previous': 3}
        )

    def test_get_metadata_last(self):
        changeset = {
            'attr1': 123, 'attr3': '123', 'attr2': 'abc', 'email': 'me@example.com',
            '_created_date': '2016-01-02T23:30:00+00:00'
        }
        changeset_id = 7
        available_changeset_ids = [7, 6, 5, 4, 3, 2, 1]

        self.assertEqual(
            get_metadata(changeset, changeset_id, available_changeset_ids),
            {'email': 'me@example.com', 'ts': '2016-01-02 23:30:00 UTC', 'next': None, 'previous': 6}
        )

    def test_get_metadata_first(self):
        changeset = {
            'attr1': 123, 'attr3': '123', 'attr2': 'abc', 'email': 'me@example.com',
            '_created_date': '2016-01-02T23:30:00+00:00'
        }
        changeset_id = 1
        available_changeset_ids = [7, 6, 5, 4, 3, 2, 1]

        self.assertEqual(
            get_metadata(changeset, changeset_id, available_changeset_ids),
            {'email': 'me@example.com', 'ts': '2016-01-02 23:30:00 UTC', 'next': 2, 'previous': None}
        )
