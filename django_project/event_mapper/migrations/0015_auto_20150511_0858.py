# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('event_mapper', '0014_auto_20150508_1133'),
    ]

    operations = [
        migrations.CreateModel(
            name='Movement',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('region', django.contrib.gis.db.models.fields.PolygonField(srid=4326)),
                ('notes', models.TextField(help_text=b'Notes for the movement.', null=True, verbose_name=b'Notes', blank=True)),
                ('notified_immediately', models.BooleanField(default=False, help_text=b'If True, there will be immediate notification.', verbose_name=b'Notified Immediately')),
                ('notification_sent', models.BooleanField(default=False, help_text=b'If True, a notification has been sent for this event.', verbose_name=b'Notification Sent')),
                ('last_updater', models.ForeignKey(verbose_name=b'Last Updater', to=settings.AUTH_USER_MODEL, help_text=b'The last user who update the movement.')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Rating',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('label', models.CharField(help_text=b'The name of the rating.', max_length=100, verbose_name=b'Rating label')),
                ('level', models.IntegerField(help_text=b'The level of the rating.', verbose_name=b'Level')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='movement',
            name='rating',
            field=models.ForeignKey(verbose_name=b'Rating', to='event_mapper.Rating', help_text=b'The rating of the movement.'),
            preserve_default=True,
        ),
    ]
