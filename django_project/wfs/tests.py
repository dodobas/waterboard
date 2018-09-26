# -*- coding: utf-8 -*-
import unittest

from .utils import parse_attributes


class TestWFS(unittest.TestCase):

    def test_parse_attributes(self):
        attributes = [
            ('zone', 'DropDown'), ('name', 'Text'), ('longitude', 'Decimal'), ('depth', 'Integer'),
            ('attribute', 'Text'), ('static_water_level', 'DropDown')
        ]

        header = ['zone', 'name', 'longitude', 'depth', 'feature_uuid']

        expected_result = [
            {'key': 'zone', 'type': 'string'}, {'key': 'name', 'type': 'string'},
            {'key': 'longitude', 'type': 'decimal'}, {'key': 'depth', 'type': 'integer'},
            {'key': 'feature_uuid', 'type': 'string'}
        ]

        self.assertEqual(parse_attributes(attributes, header), expected_result)


if __name__ == '__main__':
    unittest.main()
