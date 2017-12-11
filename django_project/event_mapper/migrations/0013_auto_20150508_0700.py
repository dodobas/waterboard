# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0012_remove_user_area_of_interest'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='east',
            field=models.FloatField(default=160, help_text=b'The east boundary of area of interest', verbose_name=b'East'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='north',
            field=models.FloatField(default=22, help_text=b'The north boundary of area of interest', verbose_name=b'North'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='south',
            field=models.FloatField(default=-27, help_text=b'The south boundary of area of interest', verbose_name=b'South'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='west',
            field=models.FloatField(default=83, help_text=b'The west boundary of area of interest', verbose_name=b'West'),
            preserve_default=True,
        ),
    ]
