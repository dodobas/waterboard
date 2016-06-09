# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import healthsites.models.assessment


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0010_resultoption_value'),
    ]

    operations = [
        migrations.AddField(
            model_name='healthsiteassessment',
            name='overall_assessment',
            field=models.IntegerField(default=healthsites.models.assessment.get_overall_assessment_random, max_length=1),
            preserve_default=True,
        ),
    ]
