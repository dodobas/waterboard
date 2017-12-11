# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0029_auto_20150618_1416'),
    ]

    operations = [
        migrations.AddField(
            model_name='eventtype',
            name='icon',
            field=models.ImageField(default='media/event_type_icon/advisory.png', help_text=b'Icon for the event type', upload_to=b'event_type_icon'),
            preserve_default=False,
        ),
    ]
