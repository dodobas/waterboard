# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0007_user_is_staff'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_data_captor',
            field=models.BooleanField(default=False, help_text=b'Data Captor can add event.', verbose_name=b'Data Captor Status.'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='user',
            name='is_staff',
            field=models.BooleanField(default=False, help_text=b'Staff can access wk-admin page.', verbose_name=b'Staff Status'),
            preserve_default=True,
        ),
    ]
