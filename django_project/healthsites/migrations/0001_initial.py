# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AssessmentCriteria',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(help_text=b'The assessment names', max_length=32)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='AssessmentGroup',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(help_text=b'The assessment group.', max_length=32)),
                ('order', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Healthsite',
            fields=[
                ('name', models.CharField(help_text=b'What the healthsite is called', max_length=100, verbose_name=b'Name')),
                ('point_geometry', django.contrib.gis.db.models.fields.PointField(srid=4326)),
                ('version', models.IntegerField()),
                ('uuid', models.CharField(help_text=b'Unique identifier', max_length=32, verbose_name=b'UUID')),
                ('date', models.DateTimeField()),
                ('id', models.AutoField(serialize=False, primary_key=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='HealthsiteAssessment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('current', models.BooleanField(default=True)),
                ('reference_url', models.URLField()),
                ('reference_file', models.FileField(upload_to=b'')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='HealthsiteAssessmentEntry',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('selected_option', models.CharField(max_length=32)),
                ('assessment_criteria', models.ForeignKey(to='healthsites.AssessmentCriteria')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ResultOption',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('option', models.CharField(max_length=32)),
                ('order', models.IntegerField()),
                ('assessment_criteria', models.ForeignKey(to='healthsites.AssessmentCriteria')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='healthsiteassessment',
            name='assessment_groups',
            field=models.ManyToManyField(to='healthsites.HealthsiteAssessmentEntry'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='healthsiteassessment',
            name='healthsite',
            field=models.ForeignKey(to='healthsites.Healthsite'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='assessmentcriteria',
            name='assessment_group',
            field=models.ForeignKey(to='healthsites.AssessmentGroup'),
            preserve_default=True,
        ),
    ]
