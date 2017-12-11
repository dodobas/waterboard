# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0022_remove_movement_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='eventtype',
            name='icon',
        ),
        migrations.RemoveField(
            model_name='perpetrator',
            name='icon',
        ),
        migrations.RemoveField(
            model_name='victim',
            name='icon',
        ),
    ]
