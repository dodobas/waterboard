# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='healthsite',
            name='date',
            field=models.DateTimeField(auto_now_add=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='healthsite',
            name='uuid',
            field=models.CharField(help_text=b'Unique identifier', unique=True, max_length=32, verbose_name=b'UUID'),
            preserve_default=True,
        ),
    ]
