# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0013_auto_20160614_0602'),
    ]

    operations = [
        migrations.AlterField(
            model_name='healthsiteassessment',
            name='overall_assessment',
            field=models.IntegerField(max_length=1),
            preserve_default=True,
        ),
    ]
