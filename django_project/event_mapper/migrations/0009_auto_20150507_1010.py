# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0008_auto_20150507_1006'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='is_data_captor',
            field=models.BooleanField(default=False, help_text=b'Data Captor can add event.', verbose_name=b'Data Captor Status'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='notified',
            field=models.BooleanField(default=False, help_text=b'Set true to get sms notification.', verbose_name=b'Notification status'),
            preserve_default=True,
        ),
    ]
