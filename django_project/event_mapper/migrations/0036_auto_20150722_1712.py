# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0035_merge'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='category',
            field=models.IntegerField(help_text=b'There are two event categories: Incident and Advisory', verbose_name=b'Category of the event', choices=[(1, b'Incident'), (2, b'Advisory')]),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='date_time',
            field=models.DateTimeField(help_text=b'Date and time when the event happened.', verbose_name=b'Date and time'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='detained',
            field=models.IntegerField(default=0, help_text=b'The number of detained people of the incident.', verbose_name=b'Detained people', blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='injured',
            field=models.IntegerField(default=0, help_text=b'The number of injured people of the incident.', verbose_name=b'Injured people', blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='killed',
            field=models.IntegerField(default=0, help_text=b'The number of killed people of the incident.', verbose_name=b'Killed people', blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='notification_sent',
            field=models.BooleanField(default=False, help_text=b'If selected, a notification has been sent for this event.', verbose_name=b'Notification Sent'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='notified_immediately',
            field=models.BooleanField(default=False, help_text=b'If selected, there will be immediate notification.', verbose_name=b'Notify Immediately'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='place_name',
            field=models.CharField(help_text=b'The name of the event location.', max_length=100, verbose_name=b'Place name'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='type',
            field=models.ForeignKey(verbose_name=b'Event type', to='event_mapper.EventType', help_text=b'The type of the event.'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='countries_notified',
            field=models.ManyToManyField(help_text=b'Select one or more countries for which you wish to receive notifications.', to='event_mapper.Country', null=True, verbose_name=b'Countries of interest', blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='east',
            field=models.FloatField(default=55, help_text=b'The eastern boundary of the area of interest.', verbose_name=b'East'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(help_text=b'Please enter your email address. This will also be your login name.', unique=True, max_length=75, verbose_name=b'Email'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='first_name',
            field=models.CharField(help_text=b'Your first name.', max_length=100, verbose_name=b'First name'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='is_active',
            field=models.BooleanField(default=True, help_text=b"Unchecked this to disable this user's account without deleting it.", verbose_name=b'Active'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='is_admin',
            field=models.BooleanField(default=False, help_text=b'Check this to make the user an admin.', verbose_name=b'Admin'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='is_confirmed',
            field=models.BooleanField(default=False, help_text=b'Whether this user has activated their account by email.', verbose_name=b'Confirmed'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='is_data_captor',
            field=models.BooleanField(default=False, help_text=b'Data capturer can add events.', verbose_name=b'Data capturer'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='is_staff',
            field=models.BooleanField(default=False, help_text=b'Staff can access wk-admin page.', verbose_name=b'Staff'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='key',
            field=models.CharField(default=b'0000000000000000000000000000000000000000', help_text=b'Account confirmation key as sent to the user by email.', max_length=40, verbose_name=b'Account confirmation key'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='last_name',
            field=models.CharField(help_text=b'Your last name.', max_length=100, verbose_name=b'Last name'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='north',
            field=models.FloatField(default=40, help_text=b'The northern boundary of the area of interest.', verbose_name=b'North'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='notified',
            field=models.BooleanField(default=False, help_text=b'Check this box to receive SMS notifications.', verbose_name=b'Receive notifications?'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='notify_immediately',
            field=models.BooleanField(default=False, help_text=b'Check this to activate immediate notifications. If unchecked, the user will only be notified by nightly batch reports.', verbose_name=b'Notify immediately'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='phone_number',
            field=models.CharField(validators=[django.core.validators.RegexValidator(regex=b'^\\+?1?\\d{9,15}$', message=b"Phone number must be entered in the format: '+6288888888888'. Up to 15 digits allowed.")], max_length=15, blank=True, help_text=b'This is optional. If entered alerts will be sent to this number', null=True, verbose_name=b'Phone number'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='south',
            field=models.FloatField(default=24, help_text=b'The southern boundary of the area of interest.', verbose_name=b'South'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='west',
            field=models.FloatField(default=28, help_text=b'The western boundary of the area of interest.', verbose_name=b'West'),
            preserve_default=True,
        ),
    ]
