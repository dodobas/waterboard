# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0022_remove_movement_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='notify_immediately',
            field=models.BooleanField(default=False, help_text=b'If True, there will be immediate notification.', verbose_name=b'Notify Immediately'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='notified_immediately',
            field=models.BooleanField(default=False, help_text=b'If True, there will be immediate notification.', verbose_name=b'Notify Immediately'),
            preserve_default=True,
        ),
    ]
