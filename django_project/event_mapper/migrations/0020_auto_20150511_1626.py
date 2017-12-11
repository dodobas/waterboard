# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0019_movement_previous_rating'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='movement',
            name='previous_rating',
        ),
        migrations.RemoveField(
            model_name='movement',
            name='rating',
        ),
        migrations.AddField(
            model_name='movement',
            name='movement_state',
            field=models.IntegerField(default=1, help_text=b'Movement state of the region.', verbose_name=b'Movement State', choices=[(1, b'Normal'), (2, b'Mission Essential'), (3, b'Mission Critical'), (4, b'Blackout')]),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='movement',
            name='risk_level',
            field=models.IntegerField(default=1, help_text=b'Risk level of the region.', verbose_name=b'Risk Level', choices=[(1, b'Insignificant'), (2, b'Low'), (3, b'Moderate'), (4, b'High'), (5, b'Extreme')]),
            preserve_default=False,
        ),
    ]
