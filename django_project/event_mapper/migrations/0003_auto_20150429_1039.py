# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0002_auto_20150429_0846'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='country',
            options={'verbose_name_plural': 'Countries'},
        ),
        migrations.AlterField(
            model_name='country',
            name='name',
            field=models.CharField(help_text=b'The name of the country.', max_length=50, verbose_name=b"Country's name"),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='eventtype',
            name='slug',
            field=models.SlugField(primary_key=True, serialize=False, blank=True, unique=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='perpetrator',
            name='slug',
            field=models.SlugField(primary_key=True, serialize=False, blank=True, unique=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='victim',
            name='slug',
            field=models.SlugField(primary_key=True, serialize=False, blank=True, unique=True),
            preserve_default=True,
        ),
    ]
