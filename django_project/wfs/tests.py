# -*- coding: utf-8 -*-
import unittest

from .utils import parse_attributes


class TestWFS(unittest.TestCase):

    def test_parse_attributes(self):
        attributes = [
            ('zone', 'DropDown', 'Zone'), ('name', 'Text', 'Name'), ('longitude', 'Decimal', 'Longitude'),
            ('depth', 'Integer', 'Depth'), ('attribute', 'Text', 'Attribute'),
            ('static_water_level', 'DropDown', 'Static Water Level (l/s)')
        ]

        header = ['zone', 'name', 'longitude', 'depth', 'feature_uuid', 'static_water_level']

        expected_result = [
            {'label': 'Zone', 'type': 'string', 'key': 'zone'}, {'label': 'Name', 'type': 'string', 'key': 'name'},
            {'label': 'Longitude', 'type': 'decimal', 'key': 'longitude'},
            {'label': 'Depth', 'type': 'integer', 'key': 'depth'},
            {'label': 'Static_Water_Level_l_s', 'type': 'string', 'key': 'static_water_level'},
            {'label': 'feature_uuid', 'type': 'string', 'key': 'feature_uuid'}
        ]

        self.assertEqual(parse_attributes(attributes, header), expected_result)


if __name__ == '__main__':
    unittest.main()
