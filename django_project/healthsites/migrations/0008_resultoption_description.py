# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0007_auto_20160531_1152'),
    ]

    operations = [
        migrations.AddField(
            model_name='resultoption',
            name='description',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
    ]
