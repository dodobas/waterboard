# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0021_auto_20150511_2130'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='movement',
            name='name',
        ),
    ]
