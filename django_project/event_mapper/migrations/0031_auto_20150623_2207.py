# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0030_eventtype_icon'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='eventtype',
            name='icon',
        ),
        migrations.AddField(
            model_name='eventtype',
            name='advisory_icon',
            field=models.ImageField(default=b'static/event_mapper/css/images/leaflet/marker-icon.png', help_text=b'Icon for the event type advisory.', upload_to=b'event_type_icon'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='eventtype',
            name='incident_icon',
            field=models.ImageField(default=b'static/event_mapper/css/images/leaflet/marker-icon.png', help_text=b'Icon for the event type incident.', upload_to=b'event_type_icon'),
            preserve_default=True,
        ),
    ]
