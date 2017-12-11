# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0020_auto_20150511_1626'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='movement',
            name='id',
        ),
        migrations.RemoveField(
            model_name='movement',
            name='region',
        ),
        migrations.AddField(
            model_name='movement',
            name='country',
            field=models.OneToOneField(primary_key=True, default=1, serialize=False, to='event_mapper.Country', help_text=b'The country where the movement happens.', verbose_name=b'Country'),
            preserve_default=False,
        ),
    ]
