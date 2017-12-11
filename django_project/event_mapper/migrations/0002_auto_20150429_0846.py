# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='countries_notified',
            field=models.ManyToManyField(help_text=b'The countries that user wants to be notified.', to='event_mapper.Country', null=True, verbose_name=b'Notified countries', blank=True),
            preserve_default=True,
        ),
    ]
