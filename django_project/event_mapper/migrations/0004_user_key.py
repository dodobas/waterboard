# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0003_auto_20150429_1039'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='key',
            field=models.CharField(default=b'0000000000000000000000000000000000000000', help_text=b'Confirmation key for user to activate their account.', max_length=40, verbose_name=b'Confirmation Key'),
            preserve_default=True,
        ),
    ]
