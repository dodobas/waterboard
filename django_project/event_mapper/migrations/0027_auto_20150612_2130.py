# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0026_merge'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='perpetrator',
            field=models.ForeignKey(blank=True, to='event_mapper.Perpetrator', help_text=b'The perpetrator of the event.', null=True, verbose_name=b'Perpetrator'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='event',
            name='victim',
            field=models.ForeignKey(blank=True, to='event_mapper.Victim', help_text=b'The victim of the event.', null=True, verbose_name=b'Victim'),
            preserve_default=True,
        ),
    ]
