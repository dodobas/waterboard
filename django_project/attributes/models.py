# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.db import models

from .constants import ATTRIBUTE_OPTIONS


class AttributeGroup(models.Model):
    name = models.CharField(
        max_length=128,
        help_text='The attribute group',
        null=False, blank=False,
        unique=True
    )
    position = models.IntegerField()

    def __unicode__(self):
        return self.name


class Attribute(models.Model):
    name = models.CharField(
        max_length=128,
        help_text='The attribute',
        null=False, blank=False
    )
    attribute_group = models.ForeignKey('AttributeGroup')
    result_type = models.CharField(
        max_length=16,
        choices=ATTRIBUTE_OPTIONS,
        null=False, blank=False
    )

    def __unicode__(self):
        return '%s - %s' % (self.attribute_group, self.name)


class AttributeOption(models.Model):
    attribute = models.ForeignKey(
        'Attribute',
        limit_choices_to={'result_type__in': ['DropDown', 'MultipleChoice']}
    )
    option = models.CharField(max_length=128)
    value = models.IntegerField()
    description = models.TextField()
    position = models.IntegerField()

    def __unicode__(self):
        return '{} ({})'.format(self.option, self.attribute.name)
