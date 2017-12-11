# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0030_auto_20150619_2116'),
    ]

    operations = [
        migrations.AlterField(
            model_name='movement',
            name='country',
            field=models.OneToOneField(verbose_name=b'Country', to='event_mapper.Country', help_text=b'The country where the movement happens.'),
            preserve_default=True,
        ),
    ]
