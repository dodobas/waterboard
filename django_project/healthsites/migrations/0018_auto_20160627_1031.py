# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0017_migrate_name_location_healthsite_to_assessment_1'),
    ]

    operations = [
        migrations.AlterField(
            model_name='healthsiteassessment',
            name='point_geometry',
            field=django.contrib.gis.db.models.fields.PointField(default='', srid=4326),
            preserve_default=False,
        ),
    ]
