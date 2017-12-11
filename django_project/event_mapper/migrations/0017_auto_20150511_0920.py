# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0016_auto_20150511_0912'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='victim',
            field=models.ForeignKey(verbose_name=b'Victim', to='event_mapper.Victim', help_text=b'The victim of the event.'),
            preserve_default=True,
        ),
    ]
