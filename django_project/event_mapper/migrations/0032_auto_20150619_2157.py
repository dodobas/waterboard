# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0031_auto_20150619_2151'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='movement',
            name='country',
        ),
        migrations.AddField(
            model_name='movement',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
            preserve_default=False,
        ),
    ]
