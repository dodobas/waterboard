# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.gis.db.models.fields


def operations(apps, schema_editor):
    assessments = apps.get_model("healthsites", "HealthsiteAssessment")
    for assessment in assessments.objects.all():
        assessment.name = assessment.healthsite.name
        assessment.point_geometry = assessment.healthsite.point_geometry
        assessment.save()


class Migration(migrations.Migration):
    dependencies = [
        ('healthsites', '0016_auto_20160627_1020'),
    ]

    operations = [
        migrations.RunPython(operations),
    ]
