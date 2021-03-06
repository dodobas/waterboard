# -*- coding: utf-8 -*-
# Generated by Django 1.11.13 on 2018-06-02 09:50
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('attributes', '0006_auto_20180501_1432'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='attribute',
            options={'ordering': ('attribute_group__position', 'position')},
        ),
        migrations.AlterModelOptions(
            name='attributegroup',
            options={'ordering': ('position',)},
        ),
        migrations.AddField(
            model_name='attribute',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
