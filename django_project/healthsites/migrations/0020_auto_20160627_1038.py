# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0019_healthsite_is_healthsites_io'),
    ]

    operations = [
        migrations.AlterField(
            model_name='healthsite',
            name='is_healthsites_io',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
