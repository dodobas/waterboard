# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0039_auto_20150804_1054'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='date_time',
            field=models.DateTimeField(help_text=b'Date and time in UTC when the event happened.', verbose_name=b'Assessment Date and Time (UTC)'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='detained',
            field=models.IntegerField(default=0, help_text=b'Metric 3', verbose_name=b'Metric 3', blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='injured',
            field=models.IntegerField(default=0, help_text=b'Metric 2', verbose_name=b'Metric 2', blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='killed',
            field=models.IntegerField(default=0, help_text=b'Metric 1', verbose_name=b'Metric 1', blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='location',
            field=django.contrib.gis.db.models.fields.PointField(help_text=b'The location of the assessment in point geometry', srid=4326, verbose_name=b'Location'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='notification_sent',
            field=models.BooleanField(default=False, help_text=b'If selected, a notification has been sent for this.', verbose_name=b'Notification Sent'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='perpetrator',
            field=models.ForeignKey(blank=True, to='event_mapper.Perpetrator', help_text=b'The assessor of the assessment.', null=True, verbose_name=b'Assessor'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='place_name',
            field=models.CharField(help_text=b'The name of the assessment location.', max_length=100, verbose_name=b'Place Name'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='reported_by',
            field=models.ForeignKey(verbose_name=b'Assessment Reporter', to=settings.AUTH_USER_MODEL, help_text=b'The user who did the assessment.'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='type',
            field=models.ForeignKey(verbose_name=b'Assessment Type', to='event_mapper.EventType', help_text=b'The type of assessment.'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='victim',
            field=models.ForeignKey(blank=True, to='event_mapper.Victim', help_text=b'The assessor organization of the assessment.', null=True, verbose_name=b'Assessor Organization'),
            preserve_default=True,
        ),
    ]
