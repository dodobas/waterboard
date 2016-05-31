# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0006_auto_20160530_1433'),
    ]

    operations = [
        migrations.AlterField(
            model_name='assessmentcriteria',
            name='name',
            field=models.CharField(help_text=b'The assessment names', max_length=128),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='assessmentcriteria',
            name='result_type',
            field=models.CharField(max_length=128, choices=[(b'DropDown', b'DropDown'), (b'Integer', b'Integer'), (b'Decimal', b'Decimal'), (b'MultipleChoice', b'MultipleChoice')]),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='assessmentgroup',
            name='name',
            field=models.CharField(help_text=b'The assessment group.', unique=True, max_length=128),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='healthsiteassessmententrydropdown',
            name='selected_option',
            field=models.CharField(max_length=32),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='resultoption',
            name='option',
            field=models.CharField(max_length=512),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='resultoption',
            name='value',
            field=models.CharField(max_length=8),
            preserve_default=True,
        ),
    ]
