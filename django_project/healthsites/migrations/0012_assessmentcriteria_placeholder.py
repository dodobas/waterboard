# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0011_healthsiteassessment_overall_assessment'),
    ]

    operations = [
        migrations.AddField(
            model_name='assessmentcriteria',
            name='placeholder',
            field=models.CharField(max_length=10, null=True, blank=True),
            preserve_default=True,
        ),
    ]
