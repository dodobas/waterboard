# coding=utf-8
"""Docstring for this file."""
__author__ = 'ismailsunni'
__project_name = 'watchkeeper'
__filename = 'movement'
__date__ = '5/11/15'
__copyright__ = 'imajimatika@gmail.com'
__doc__ = ''

from django.contrib.gis.db import models
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.template.loader import render_to_string

from event_mapper.models.user import User
from event_mapper.models.country import Country
from event_mapper.models.province import Province


class Movement(models.Model):
    """Movement model."""

    class Meta:
        """Meta class."""
        app_label = 'event_mapper'

    INSIGNIFICANT_CODE = 1
    LOW_CODE = 2
    MODERATE_CODE = 3
    HIGH_CODE = 4
    EXTREME_CODE = 5

    RISK_LEVELS = (
        (INSIGNIFICANT_CODE, 'Insignificant'),
        (LOW_CODE, 'Low'),
        (MODERATE_CODE, 'Moderate'),
        (HIGH_CODE, 'High'),
        (EXTREME_CODE, 'Extreme'),
    )

    NORMAL_CODE = 1
    MISSION_ESSENTIAL_CODE = 2
    MISSION_CRITICAL_CODE = 3
    BLACKOUT_CODE = 4

    MOVEMENT_STATES = (
        (NORMAL_CODE, 'Normal'),
        (MISSION_ESSENTIAL_CODE, 'Mission Essential'),
        (MISSION_CRITICAL_CODE, 'Mission Critical'),
        (BLACKOUT_CODE, 'Blackout'),
    )

    risk_level = models.IntegerField(
        choices=RISK_LEVELS,
        verbose_name='Risk Level',
        help_text='Risk level of the region.'
    )

    movement_state = models.IntegerField(
        choices=MOVEMENT_STATES,
        verbose_name='Movement State',
        help_text='Movement state of the region.'
    )

    boundary_type = models.ForeignKey(
        ContentType,
        blank=True,
        null=True
    )

    boundary_id = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    boundary = GenericForeignKey(
        'boundary_type',
        'boundary_id'
    )

    notes = models.TextField(
        verbose_name='Notes',
        help_text='Notes for the movement.',
        blank=True,
        null=True
    )

    notified_immediately = models.BooleanField(
        verbose_name='Notified Immediately',
        help_text='If True, there will be immediate notification.',
        default=False
    )

    notification_sent = models.BooleanField(
        verbose_name='Notification Sent',
        help_text='If True, a notification has been sent for this event.',
        default=False
    )

    last_updater = models.ForeignKey(
        User,
        verbose_name='Last Updater',
        help_text='The last user who update the movement.'
    )

    last_updated_time = models.DateTimeField(
        verbose_name='Last Updated Time',
        help_text='When the movement updated for the most recent.',
        null=False,
        blank=True,
        default=timezone.now,
    )

    objects = models.GeoManager()

    def __str__(self):
        return self.boundary.name

    #
    # def save(self, *args, **kwargs):
    #     """Overloaded save method."""
    #     try:
    #         original_object = Movement.objects.get(pk=self.pk)
    #         is_change = (self.risk_level != original_object.risk_level or
    #                      self.movement_state != original_object.movement_state)
    #         if is_change:
    #             self.notification_sent = False
    #             self.last_updated_time = timezone.now()
    #     except ObjectDoesNotExist:
    #         # New object
    #         self.notification_sent = False
    #         self.last_updated_time = timezone.now()
    #
    #     super(Movement, self).save(*args, **kwargs)

    @classmethod
    def get_movement_state_label(cls, index):
        for the_tuple in cls.MOVEMENT_STATES:
            if the_tuple[0] == index:
                return the_tuple[1]

    def movement_state_label(self):
        return Movement.get_movement_state_label(self.movement_state)

    @classmethod
    def get_risk_level_label(cls, index):
        for the_tuple in cls.RISK_LEVELS:
            if the_tuple[0] == index:
                return the_tuple[1]

    def risk_level_label(self):
        return Movement.get_risk_level_label(self.risk_level)

    def text_report(self):
        """Create a report from the current movement state.
        :returns: A report that represent the movement.
        :rtype: str
        """
        if self.boundary_type.model_class() == Country:
            content = 'Movement state in %s (country) is ' % self.boundary.name
        # elif self.boundary_type.model_class() == Province:
        else:
            content = (
                'Movement state in %s (province) of %s (country) is ' %
                (self.boundary.name, self.boundary.country)
            )

        content += (
            '%s and has risk level %s. The last update of movement state is '
            'on %s by %s' % (
                self.get_movement_state_display(),
                self.get_risk_level_display(),
                self.last_updated_time,
                self.last_updater.get_full_name()
            )
        )

        return content

    def html_report(self):
        """Generate html report for the movement."""
        report = render_to_string(
            'email_templates/movement_alert.html',
            {'movement': self})
        return report.replace('\n', '')
