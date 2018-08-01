# -*- coding: utf-8 -*-

# https://simpleisbetterthancomplex.com/tutorial/2016/08/01/how-to-upload-files-with-django.html

from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.gis.db import models


class Document(models.Model):
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='uploads/%Y/%m/%d/')
    file_format = models.CharField(max_length=10)
