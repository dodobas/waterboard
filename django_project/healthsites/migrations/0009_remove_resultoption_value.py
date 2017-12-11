# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0008_resultoption_description'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='resultoption',
            name='value',
        ),
    ]
