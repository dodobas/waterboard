# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0023_auto_20150520_2045'),
    ]

    operations = [
        migrations.AlterField(
            model_name='country',
            name='polygon_geometry',
            field=django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326),
            preserve_default=True,
        ),
    ]
