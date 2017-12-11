# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'commons'
__date__ = '5/4/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''


def get_verbose_name(model_class, field_name):
    """Return verbose name of a field from a model class.

    :param model_class: A django model class.
    :type model_class: django.contrib.gis.db.models.Model

    :param field_name: A string represented the field name.
    :type field_name: str

    :returns: A verbose name of a field from a model class.
    """
    # noinspection PyProtectedMember
    return model_class._meta.get_field(field_name).verbose_name.title()


def get_help_text(model_class, field_name):
    """Return verbose name of a field from a model class.

    :param model_class: A django model class.
    :type model_class: django.contrib.gis.db.models.Model

    :param field_name: A string represented the field name.
    :type field_name: str

    :returns: A verbose name of a field from a model class.
    """
    # noinspection PyProtectedMember
    return model_class._meta.get_field(field_name).help_text
