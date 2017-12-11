# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0009_auto_20150507_1010'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='phone_number',
            field=models.CharField(help_text=b'It will be used for sending a notification if you want.', max_length=25, null=True, verbose_name=b'Your phone number.', blank=True),
            preserve_default=True,
        ),
    ]
