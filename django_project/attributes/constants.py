# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

SIMPLE_ATTRIBUTE_OPTIONS = (
    ('Integer', 'Integer'),
    ('Decimal', 'Decimal'),
    ('Text', 'Text')
)

CHOICE_ATTRIBUTE_OPTIONS = (
    ('DropDown', 'DropDown'),
)

ATTRIBUTE_OPTIONS = SIMPLE_ATTRIBUTE_OPTIONS + CHOICE_ATTRIBUTE_OPTIONS

SYSTEM_KEYS = ['point_geometry', 'email', 'ts', 'feature_uuid', 'changeset_id']
