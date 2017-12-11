# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0017_auto_20150511_0920'),
    ]

    operations = [
        migrations.AddField(
            model_name='movement',
            name='last_updated_time',
            field=models.DateTimeField(default=django.utils.timezone.now, help_text=b'When the movement updated for the most recent.', verbose_name=b'Last Updated Time', blank=True),
            preserve_default=True,
        ),
    ]
