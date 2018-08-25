# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.auth.decorators import login_required
from django.http import Http404
from django.utils.decorators import method_decorator


class LoginRequiredMixin(object):
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


class AdminRequiredMixin(LoginRequiredMixin):
    def dispatch(self, *args, **kwargs):
        if self.request.user.is_staff:
            return super().dispatch(*args, **kwargs)
        else:
            raise Http404
