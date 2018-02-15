# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function, unicode_literals

from django.db import models
from django.utils.text import slugify

from .constants import ATTRIBUTE_OPTIONS, CHOICE_ATTRIBUTE_OPTIONS, SIMPLE_ATTRIBUTE_OPTIONS


class AttributeGroup(models.Model):
    label = models.CharField(
        max_length=128,
        help_text='The attribute group',
        null=False, blank=False,
        unique=True
    )
    key = models.CharField(
        max_length=32,
        help_text='internal key of the attribute group',
        null=False, blank=False, unique=True
    )
    position = models.IntegerField(default=0)

    def __unicode__(self):
        return self.label

    def save(self, *args, **kwargs):
        # when creating a new AttributeGroup, auto generate key
        if self.pk is None:
            self.key = slugify(self.label)

        super(AttributeGroup, self).save(*args, **kwargs)


class Attribute(models.Model):
    label = models.CharField(
        max_length=128,
        help_text='The attribute',
        null=False, blank=False
    )
    key = models.CharField(
        max_length=32,
        help_text='internal key of the attribute',
        null=False, blank=False, unique=True
    )
    attribute_group = models.ForeignKey('AttributeGroup', related_name='attributes')
    result_type = models.CharField(
        max_length=16,
        choices=ATTRIBUTE_OPTIONS,
        null=False, blank=False
    )
    position = models.IntegerField(default=0)
    required = models.BooleanField(default=False)
    searchable = models.BooleanField(default=False)
    orderable = models.BooleanField(default=True)

    def __unicode__(self):
        return '%s - %s' % (self.attribute_group, self.label)

    def save(self, *args, **kwargs):
        # when creating a new Attribute, auto generate key
        if self.pk is None:
            # TODO: we need to replace '-' with '_' so that we do not need to quote attributes in the database
            self.key = slugify(self.label).replace('-', '_')

        super(Attribute, self).save(*args, **kwargs)


class SimpleAttributeManager(models.Manager):
    def get_queryset(self):
        qs = super(SimpleAttributeManager, self).get_queryset()

        return qs.filter(result_type__in=[name for name, _ in SIMPLE_ATTRIBUTE_OPTIONS])


class SimpleAttribute(Attribute):

    objects = SimpleAttributeManager()

    class Meta:
        proxy = True


class ChoiceAttributeManager(models.Manager):
    def get_queryset(self):
        qs = super(ChoiceAttributeManager, self).get_queryset()

        return qs.filter(result_type__in=[name for name, _ in CHOICE_ATTRIBUTE_OPTIONS])


class ChoiceAttribute(Attribute):

    objects = ChoiceAttributeManager()

    class Meta:
        proxy = True


class AttributeOption(models.Model):
    attribute = models.ForeignKey(
        'Attribute',
        limit_choices_to={'result_type__in': [name for name, _ in CHOICE_ATTRIBUTE_OPTIONS]}
    )
    option = models.CharField(max_length=128)
    value = models.IntegerField()
    description = models.TextField(blank=True)
    position = models.IntegerField()

    class Meta:
        unique_together = ('attribute', 'value')

    def __unicode__(self):
        return '{}'.format(self.option)
