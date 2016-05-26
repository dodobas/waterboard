# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('healthsites', '0003_auto_20160506_1506'),
    ]

    operations = [
        migrations.AddField(
            model_name='healthsiteassessment',
            name='created_date',
            field=models.DateTimeField(default=datetime.datetime(2016, 5, 25, 14, 31, 44, 74535)),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='healthsiteassessment',
            name='data_captor',
            field=models.ForeignKey(default=None, to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='assessmentgroup',
            name='name',
            field=models.CharField(help_text=b'The assessment group.', unique=True, max_length=32),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='healthsiteassessment',
            name='reference_file',
            field=models.FileField(upload_to=b'', blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='healthsiteassessment',
            name='reference_url',
            field=models.URLField(blank=True),
            preserve_default=True,
        ),
    ]
