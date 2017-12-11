# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0028_auto_20150615_2323'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='phone_number',
            field=models.CharField(validators=[django.core.validators.RegexValidator(regex=b'^\\+?1?\\d{9,15}$', message=b"Phone number must be entered in the format: '+6288888888888'. Up to 15 digits allowed.")], max_length=15, blank=True, help_text=b'It will be used for sending a notification if you want.', null=True, verbose_name=b'Your phone number.'),
            preserve_default=True,
        ),
    ]
