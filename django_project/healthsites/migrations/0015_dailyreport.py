# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0014_auto_20160620_1204'),
    ]

    operations = [
        migrations.CreateModel(
            name='DailyReport',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date_time', models.DateTimeField(help_text=b'Date and time in UTC for the report..', verbose_name=b'Date and Time (UTC)')),
                ('start_time', models.DateTimeField(help_text=b'The starting period of the report in UTC ', verbose_name=b'Start Period (UTC)')),
                ('end_time', models.DateTimeField(help_text=b'The end period of the report in UTC ', verbose_name=b'End Period (UTC)')),
                ('file_path', models.CharField(help_text=b'The location of the report.', max_length=100, verbose_name=b'File Path')),
                ('assessment_number', models.IntegerField(default=0, help_text=b'The number of Assessment in the report', verbose_name=b'Number of Assessment', blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
