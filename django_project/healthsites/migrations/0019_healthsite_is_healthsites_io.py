# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0018_auto_20160627_1031'),
    ]

    operations = [
        migrations.AddField(
            model_name='healthsite',
            name='is_healthsites_io',
            field=models.BooleanField(default=True),
            preserve_default=True,
        ),
    ]
