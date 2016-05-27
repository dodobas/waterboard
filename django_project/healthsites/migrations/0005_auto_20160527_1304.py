# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0004_auto_20160525_1431'),
    ]

    operations = [
        migrations.AlterField(
            model_name='healthsiteassessment',
            name='created_date',
            field=models.DateTimeField(default=datetime.datetime.now),
            preserve_default=True,
        ),
    ]
