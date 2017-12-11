# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0010_auto_20150507_1025'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='east',
            field=models.FloatField(default=0, help_text=b'The east boundary of area of interest', verbose_name=b'East'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='user',
            name='north',
            field=models.FloatField(default=0, help_text=b'The north boundary of area of interest', verbose_name=b'North'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='user',
            name='south',
            field=models.FloatField(default=0, help_text=b'The south boundary of area of interest', verbose_name=b'South'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='user',
            name='west',
            field=models.FloatField(default=0, help_text=b'The west boundary of area of interest', verbose_name=b'West'),
            preserve_default=True,
        ),
    ]
