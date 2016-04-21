# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Healthsite',
            fields=[
                ('name', models.CharField(help_text=b'What the healthsite is called', max_length=50, verbose_name=b'Name')),
                ('point_geometry', django.contrib.gis.db.models.fields.PointField(srid=4326)),
                ('version', models.IntegerField()),
                ('uuid', models.CharField(help_text=b'Unique identifier', max_length=30, verbose_name=b'UUID')),
                ('date', models.DateTimeField()),
                ('id', models.AutoField(serialize=False, primary_key=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
