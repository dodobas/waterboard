# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'event'
__date__ = '4/10/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

from django.contrib.gis.db import models
from django.template.loader import render_to_string

from event_type import EventType
from perpetrator import Perpetrator
from victim import Victim

from event_mapper.models.user import User


class Event(models.Model):
    """Event model."""

    class Meta:
        """Meta Class"""
        app_label = 'event_mapper'

    INCIDENT_CODE = 1
    ADVISORY_CODE = 2

    CATEGORY_CHOICES = (
        (INCIDENT_CODE, 'Incident'),
        (ADVISORY_CODE, 'Advisory'),
    )

    category = models.IntegerField(
        choices=CATEGORY_CHOICES,
        verbose_name="Event's Category",
        help_text='There are two event categories: Incident and Advisory'
    )

    location = models.PointField(
        verbose_name='Location',
        help_text='The location of the assessment in point geometry',
        srid=4326,
        null=False,
        blank=False
    )

    place_name = models.CharField(
        verbose_name='Place Name',
        help_text='The name of the assessment location.',
        max_length=100
    )

    date_time = models.DateTimeField(
        verbose_name='Assessment Date and Time (UTC)',
        help_text='Date and time in UTC when the event happened.'
    )

    type = models.ForeignKey(
        EventType,
        verbose_name='Assessment Type',
        help_text='The type of assessment.'
    )

    perpetrator = models.ForeignKey(
        Perpetrator,
        verbose_name='Assessor',
        help_text='The assessor of the assessment.',
        blank=True,
        null=True
    )

    victim = models.ForeignKey(
        Victim,
        verbose_name='Assessor Organization',
        help_text='The assessor organization of the assessment.',
        blank=True,
        null=True
    )

    killed = models.IntegerField(
        verbose_name='Metric 1',
        help_text='Metric 1',
        default=0,
        blank=True
    )

    injured = models.IntegerField(
        verbose_name='Metric 2',
        help_text='Metric 2',
        default=0,
        blank=True
    )

    detained = models.IntegerField(
        verbose_name='Metric 3',
        help_text='Metric 3',
        default=0,
        blank=True
    )

    source = models.TextField(
        verbose_name='Source',
        help_text='The source where the event comes from.',
        blank=True,
    )

    notes = models.TextField(
        verbose_name='Notes',
        help_text='Additional notes for the event.',
        blank=True,
        null=True
    )

    reported_by = models.ForeignKey(
        User,
        verbose_name='Assessment Reporter',
        help_text='The user who did the assessment.'
    )

    notified_immediately = models.BooleanField(
        verbose_name='Notify Immediately',
        help_text='If selected, there will be immediate notification.',
        default=False
    )

    notification_sent = models.BooleanField(
        verbose_name='Notification Sent',
        help_text='If selected, a notification has been sent for this.',
        default=False
    )

    objects = models.GeoManager()

    def __str__(self):
        try:
            return '%s of %s by %s' % (
                self.get_category_display(),
                self.type.name,
                self.perpetrator.name
            )
        except AttributeError:
            return '%s of %s' % (
                self.get_category_display(),
                self.type.name
            )

    def save(self, *args, **kwargs):
        super(Event, self).save(*args, **kwargs)

    def get_coords(self):
        return '%.5f %.5f' % self.location.get_coords()

    def long_message(self):
        return '%s was reported at %s %s' % (
            self.__str__(),
            self.place_name,
            self.location.get_coords())

    def text_report(self):
        """Generate report for the event in html format."""
        report = render_to_string(
            'email_templates/event_alert.txt',
            {'event': self, 'category': self.get_category_display()})
        return report

    def html_report(self):
        """Generate report for the event in html format."""
        report = render_to_string(
            'email_templates/event_alert.html',
            {'event': self, 'category': self.get_category_display()})
        return report.replace('\n', '')

    def html_table_row(self):
        summary = ''
        if self.category == self.INCIDENT_CODE:
            summary = (
                'A %(type)s launched by %(perpetrator)s against '
                '%(victim)s was reported. %(killed)d people where killed.'
                '%(injured)d people where injured. '
                '%(detained)d people where detained.') % {
                    'type': self.type.name,
                    'perpetrator': self.perpetrator.name,
                    'victim': self.victim.name,
                    'killed': self.killed or 0,
                    'injured': self.injured or 0,
                    'detained': self.detained or 0}
        if self.category == self.ADVISORY_CODE:
            summary = (
                'An advisory about a %s(type)s launched by '
                '%(perpetrator)s against %(victim)s was issued. ') % {
                    'type': self.type.name,
                    'perpetrator': self.perpetrator.name,
                    'victim': self.victim.name}
        style = (
            "font-family: trebuchet MS; font-size: 10pt;"
            "border-bottom-color: rgb(128, 128, 128);"
            "border-bottom-width: 0.75px; border-bottom-style: solid;")
        html = u"""
        <tr style=3D"margin-top: 5px; margin-bottom: 5px;">
            <td width=3D"25%%" valign=3D"top" style=3D"%(style)s">
                %(place)s (%(coordinates)s), %(date_time)s
            </td>
            <td width=3D"75%%" valign=3D"top"
                style=3D"%(style)s">
                %(summary)s
                <br>
                %(notes)s
            </td>
        </tr>
        """ % {
            'place': self.place_name,
            'coordinates': self.location.get_coords(),
            'date_time': self.date_time,
            'style': style,
            'summary': summary,
            'notes': self.notes,
        }
        return html

