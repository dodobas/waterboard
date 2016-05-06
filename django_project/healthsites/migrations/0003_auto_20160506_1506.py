# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0002_auto_20160506_1437'),
    ]

    operations = [
        migrations.AlterField(
            model_name='assessmentcriteria',
            name='result_type',
            field=models.CharField(max_length=32, choices=[(b'DropDown', b'DropDown'), (b'Integer', b'Integer'), (b'Decimal', b'Decimal'), (b'MultipleChoice', b'MultipleChoice')]),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='resultoption',
            name='value',
            field=models.IntegerField(),
            preserve_default=True,
        ),
    ]
