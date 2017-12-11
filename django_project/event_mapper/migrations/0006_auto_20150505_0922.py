# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0005_user_is_confirmed'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='date_time',
            field=models.DateTimeField(help_text=b'Date and time when the event happened.', verbose_name=b'Date and Time'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='victim',
            field=models.ForeignKey(default=0, verbose_name=b'Victim', to='event_mapper.Victim', help_text=b'The victim of the event.'),
            preserve_default=True,
        ),
    ]
