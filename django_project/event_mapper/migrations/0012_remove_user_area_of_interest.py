# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0011_auto_20150507_1840'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='area_of_interest',
        ),
    ]
