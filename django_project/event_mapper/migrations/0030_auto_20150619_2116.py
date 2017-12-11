# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0029_auto_20150618_1416'),
    ]

    operations = [
        migrations.CreateModel(
            name='Province',
            fields=[
                ('name', models.CharField(help_text=b'The name of the province or state.', max_length=50, verbose_name=b'')),
                ('polygon_geometry', django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326)),
                ('id', models.AutoField(serialize=False, primary_key=True)),
                ('country', models.ForeignKey(to='event_mapper.Country')),
            ],
            options={
                'verbose_name_plural': 'Provinces',
            },
            bases=(models.Model,),
        ),
        migrations.AlterField(
            model_name='country',
            name='id',
            field=models.AutoField(serialize=False, primary_key=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='country',
            name='name',
            field=models.CharField(help_text=b'The name of the country.', max_length=50, verbose_name=b''),
            preserve_default=True,
        ),
    ]
