# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0018_movement_last_updated_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='movement',
            name='previous_rating',
            field=models.ForeignKey(related_name='previous_rating', verbose_name=b'Previous Rating', to='event_mapper.Rating', help_text=b'The previous rating of the movement.', null=True),
            preserve_default=True,
        ),
    ]
