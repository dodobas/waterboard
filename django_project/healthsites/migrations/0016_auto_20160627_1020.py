# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0015_dailyreport'),
    ]

    operations = [
        migrations.AddField(
            model_name='healthsiteassessment',
            name='name',
            field=models.CharField(default='', help_text=b'What the assessment is called', max_length=100, verbose_name=b'Name'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='healthsiteassessment',
            name='point_geometry',
            field=django.contrib.gis.db.models.fields.PointField(srid=4326, null=True, blank=True),
            preserve_default=True,
        ),
    ]
