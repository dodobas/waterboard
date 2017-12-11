# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0038_dailyreport'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dailyreport',
            name='end_time',
            field=models.DateTimeField(help_text=b'The end period of the report in UTC ', verbose_name=b'End Period (UTC)'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='dailyreport',
            name='start_time',
            field=models.DateTimeField(help_text=b'The starting period of the report in UTC ', verbose_name=b'Start Period (UTC)'),
            preserve_default=True,
        ),
    ]
