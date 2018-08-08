# -*- coding: utf-8 -*-

# https://simpleisbetterthancomplex.com/tutorial/2016/08/01/how-to-upload-files-with-django.html

from __future__ import absolute_import, division, print_function, unicode_literals

from django.contrib.gis.db import models
from django.utils import timezone


class File(models.Model):
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='uploads/%Y/%m/%d/')
    file_format = models.CharField(max_length=10)
    user_id = models.IntegerField()


class FileHistory(models.Model):
    STATE_CHOICES = (('u', 'Uploaded and analysed'),
                     ('i', 'Inserted in database'),
                     ('n', 'None'))

    changed_at = models.DateTimeField(default=timezone.now())
    old_state = models.CharField(max_length=2, choices=STATE_CHOICES, default='n')
    new_state = models.CharField(max_length=2, choices=STATE_CHOICES)
    file_name = models.CharField(max_length=100)
    user_id = models.IntegerField()
    error_msgs = models.TextField(default='empty')
    file_id = models.IntegerField()
