# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0013_auto_20150508_0700'),
    ]

    operations = [
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
    ]
