# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='WatchkeeperSettings',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('alerts', models.BooleanField(default=False, help_text=b'Use the alerts module.')),
                ('movements', models.BooleanField(default=False, help_text=b'Use the movements module.')),
                ('healthsites', models.BooleanField(default=True, help_text=b'Use the healthsites module.')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
