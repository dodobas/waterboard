# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf import settings
from django.contrib.auth.decorators import user_passes_test


def login_forbidden(fun=None, redirect_to=None):

    if redirect_to is None:
        redirect_to = settings.START_PAGE_URL

    actual_decorator = user_passes_test(lambda u: not u.is_authenticated(), login_url=redirect_to)

    if fun:
        return actual_decorator(fun)

    return actual_decorator
