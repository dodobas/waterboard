# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0006_auto_20150505_0922'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_staff',
            field=models.BooleanField(default=False, help_text=b'Whether this user is staff or not.', verbose_name=b'Staff Status'),
            preserve_default=True,
        ),
    ]
