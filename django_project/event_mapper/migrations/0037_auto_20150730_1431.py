# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0036_auto_20150722_1712'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='category',
            field=models.IntegerField(help_text=b'There are two event categories: Incident and Advisory', verbose_name=b"Event's Category", choices=[(1, b'Incident'), (2, b'Advisory')]),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='date_time',
            field=models.DateTimeField(help_text=b'Date and time in UTC when the event happened.', verbose_name=b'Date and Time (UTC)'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='detained',
            field=models.IntegerField(default=0, help_text=b'The number of detained people of the incident.', verbose_name=b'Detained People', blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='injured',
            field=models.IntegerField(default=0, help_text=b'The number of injured people of the incident.', verbose_name=b'Injured People', blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='killed',
            field=models.IntegerField(default=0, help_text=b'The number of killed people of the incident.', verbose_name=b'Killed People', blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='place_name',
            field=models.CharField(help_text=b'The name of the event location.', max_length=100, verbose_name=b'Place Name'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='type',
            field=models.ForeignKey(verbose_name=b'Event Type', to='event_mapper.EventType', help_text=b'The type of the event.'),
            preserve_default=True,
        ),
    ]
