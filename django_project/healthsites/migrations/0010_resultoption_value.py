# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0009_remove_resultoption_value'),
    ]

    operations = [
        migrations.AddField(
            model_name='resultoption',
            name='value',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
