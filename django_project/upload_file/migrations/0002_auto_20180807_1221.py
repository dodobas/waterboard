# -*- coding: utf-8 -*-
# Generated by Django 1.11.13 on 2018-08-07 10:21
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('upload_file', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='filehistory',
            name='file_id',
            field=models.IntegerField(),
        ),
    ]