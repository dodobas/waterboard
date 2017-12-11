# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0004_user_key'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_confirmed',
            field=models.BooleanField(default=False, help_text=b'Whether this user has approved their entry by email.', verbose_name=b'Confirmation Status'),
            preserve_default=True,
        ),
    ]
