# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthsites', '0002_resultoption_value'),
    ]

    operations = [
        migrations.CreateModel(
            name='HealthsiteAssessmentEntryDropDown',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('selected_option', models.CharField(max_length=32)),
                ('assessment_criteria', models.ForeignKey(to='healthsites.AssessmentCriteria')),
                ('healthsite_assessment', models.ForeignKey(to='healthsites.HealthsiteAssessment')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='HealthsiteAssessmentEntryInteger',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('selected_option', models.IntegerField()),
                ('assessment_criteria', models.ForeignKey(to='healthsites.AssessmentCriteria')),
                ('healthsite_assessment', models.ForeignKey(to='healthsites.HealthsiteAssessment')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='HealthsiteAssessmentEntryReal',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('selected_option', models.DecimalField(max_digits=9, decimal_places=2)),
                ('assessment_criteria', models.ForeignKey(to='healthsites.AssessmentCriteria')),
                ('healthsite_assessment', models.ForeignKey(to='healthsites.HealthsiteAssessment')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='healthsiteassessmententry',
            name='assessment_criteria',
        ),
        migrations.RemoveField(
            model_name='healthsiteassessment',
            name='assessment_groups',
        ),
        migrations.DeleteModel(
            name='HealthsiteAssessmentEntry',
        ),
        migrations.AddField(
            model_name='assessmentcriteria',
            name='result_type',
            field=models.CharField(default='Integer', max_length=32, choices=[(b'DropDown', b'DropDown'), (b'Integer', b'Integer'), (b'Decimal', b'Decimal')]),
            preserve_default=False,
        ),
    ]
