# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0012_assessmentcriteria_placeholder'),
    ]

    operations = [
        migrations.AlterField(
            model_name='assessmentcriteria',
            name='placeholder',
            field=models.CharField(max_length=20, null=True, blank=True),
            preserve_default=True,
        ),
    ]
