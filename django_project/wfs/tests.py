# -*- coding: utf-8 -*-
import datetime
import unittest

from .utils import parse_attributes, parse_data


class TestWFS(unittest.TestCase):

    def test_parse_attributes(self):
        attributes = [
            ('zone', 'DropDown'), ('name', 'Text'), ('longitude', 'Decimal'), ('depth', 'Integer'),
            ('attribute', 'Text')
        ]

        header = ['zone', 'name', 'longitude', 'depth', 'feature_uuid']

        expected_result = [
            {'key': 'zone', 'type': 'string'}, {'key': 'name', 'type': 'string'},
            {'key': 'longitude', 'type': 'decimal'}, {'key': 'depth', 'type': 'integer'},
            {'key': 'feature_uuid', 'type': 'string'}
        ]

        self.assertEqual(parse_attributes(attributes, header), expected_result)

    def test_parse_data(self):
        cursor_description = (('point_geometry', ), ('email', ), ('ts', ), ('depth', ))
        cursor_fetchall = [('010001010929300002020', None, datetime.datetime(2018, 9, 10, 20, 57, 24), 2.34)]
        expected_result = [
            {'point_geometry': '010001010929300002020', 'email': '', 'ts': '2018-09-10 20:57:24', 'depth': 2.34}
        ]

        self.assertEqual(parse_data(cursor_description, cursor_fetchall), expected_result)


if __name__ == '__main__':
    unittest.main()
