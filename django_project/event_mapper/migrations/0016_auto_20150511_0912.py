# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0015_auto_20150511_0858'),
    ]

    operations = [
        migrations.AddField(
            model_name='movement',
            name='name',
            field=models.CharField(default='Jaran', help_text=b'The name of the movement.', max_length=100, verbose_name=b'Movement Name'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='movement',
            name='region',
            field=django.contrib.gis.db.models.fields.PolygonField(help_text=b'The location of the event in polygon geometry', srid=4326, verbose_name=b'Region'),
            preserve_default=True,
        ),
    ]
