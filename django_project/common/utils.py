# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from itertools import izip_longest


def grouper(iterable, n, fillvalue=None):
    # https://docs.python.org/2/library/itertools.html#recipes
    args = [iter(iterable)] * n
    return izip_longest(*args, fillvalue=fillvalue)
