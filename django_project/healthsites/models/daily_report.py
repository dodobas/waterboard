# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'daily_report'
__date__ = '8/3/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

from django.db import models


class DailyReport(models.Model):
    """Model for Daily Report."""

    date_time = models.DateTimeField(
        verbose_name='Date and Time (UTC)',
        help_text='Date and time in UTC for the report..',
        null=False,
        blank=False
    )

    start_time = models.DateTimeField(
        verbose_name='Start Period (UTC)',
        help_text='The starting period of the report in UTC ',
        null=False,
        blank=False
    )

    end_time = models.DateTimeField(
        verbose_name='End Period (UTC)',
        help_text='The end period of the report in UTC ',
        null=False,
        blank=False
    )

    file_path = models.CharField(
        verbose_name='File Path',
        help_text='The location of the report.',
        max_length=100
    )

    assessment_number = models.IntegerField(
        verbose_name='Number of Assessment',
        help_text='The number of Assessment in the report',
        default=0,
        blank=True
    )

    def __str__(self):
        return self.date_time.strftime('%d %B %Y')
