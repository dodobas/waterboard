# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from itertools import zip_longest
from random import choices


def grouper(iterable, n, fillvalue=None):
    # https://docs.python.org/2/library/itertools.html#recipes
    args = [iter(iterable)] * n
    return zip_longest(*args, fillvalue=fillvalue)


def random_string(num_chracters):
    items = '0123456789abcdefghijklmnopqrstuvwxyz'
    random_str = ''.join(choices(items, k=num_chracters))
    return random_str
