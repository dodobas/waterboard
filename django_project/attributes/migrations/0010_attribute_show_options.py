# -*- coding: utf-8 -*-
# Generated by Django 1.11.13 on 2018-08-27 12:48
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('attributes', '0009_auto_20180809_0902'),
    ]

    operations = [
        migrations.AddField(
            model_name='attribute',
            name='show_options',
            field=models.BooleanField(default=False),
        ),
    ]