# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone
from django.conf import settings
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(default=django.utils.timezone.now, verbose_name='last login')),
                ('email', models.EmailField(help_text=b'Your email. It will be used as your username also.', unique=True, max_length=75, verbose_name=b'Email')),
                ('first_name', models.CharField(help_text=b'Your first name.', max_length=100, verbose_name=b'First Name')),
                ('last_name', models.CharField(help_text=b'Your first name.', max_length=100, verbose_name=b'Last Name')),
                ('phone_number', models.CharField(help_text=b'It will be used for sending a notification if you want.', max_length=25, verbose_name=b'Your phone number.', blank=True)),
                ('notified', models.BooleanField(default=False, help_text=b'Set True to get sms notification.', verbose_name=b'Notification status.')),
                ('is_active', models.BooleanField(default=True, help_text=b'Whether this user is still active or not (a user could be banned or deleted).', verbose_name=b'Active Status')),
                ('is_admin', models.BooleanField(default=False, help_text=b'Whether this user is admin or not.', verbose_name=b'Admin Status')),
                ('area_of_interest', django.contrib.gis.db.models.fields.PolygonField(default=None, srid=4326, blank=True, help_text=b'Area of interest of the user.', null=True, verbose_name=b'Area of Interest')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Country',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(help_text=b'The name of the country.', max_length=50, verbose_name=b'Country\\s name')),
                ('polygon_geometry', django.contrib.gis.db.models.fields.PolygonField(srid=4326)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('category', models.IntegerField(help_text=b'There are two event categories: Incident and Advisory', verbose_name=b'Category of the event.', choices=[(1, b'Incident'), (2, b'Advisory')])),
                ('location', django.contrib.gis.db.models.fields.PointField(help_text=b'The location of the event in point geometry', srid=4326, verbose_name=b'Location')),
                ('place_name', models.CharField(help_text=b'The name of the event location.', max_length=100, verbose_name=b'Place Name')),
                ('date_time', models.DateTimeField(help_text=b'Date and time when the event happened.', verbose_name=b'Date and Time (UTC)')),
                ('killed', models.IntegerField(default=0, help_text=b'The number of killed people of the incident.', verbose_name=b'Killed People')),
                ('injured', models.IntegerField(default=0, help_text=b'The number of injured people of the incident.', verbose_name=b'Injured People')),
                ('detained', models.IntegerField(default=0, help_text=b'The number of detained people of the incident.', verbose_name=b'Detained People')),
                ('source', models.TextField(help_text=b'The source where the event comes from.', verbose_name=b'Source', blank=True)),
                ('notes', models.TextField(help_text=b'Additional notes for the event.', null=True, verbose_name=b'Notes', blank=True)),
                ('notified_immediately', models.BooleanField(default=False, help_text=b'If True, there will be immediate notification.', verbose_name=b'Notified Immediately')),
                ('notification_sent', models.BooleanField(default=False, help_text=b'If True, a notification has been sent for this event.', verbose_name=b'Notification Sent')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='EventType',
            fields=[
                ('slug', models.SlugField(unique=True, serialize=False, primary_key=True)),
                ('name', models.CharField(help_text=b'A name for the event type.', unique=True, max_length=100)),
                ('description', models.TextField(help_text=b'Description for the event type.', blank=True)),
                ('icon', models.ImageField(help_text=b'The icon for the event type.', upload_to=b'event_type_icon', blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Perpetrator',
            fields=[
                ('slug', models.SlugField(unique=True, serialize=False, primary_key=True)),
                ('name', models.CharField(help_text=b'A name for the perpetrator.', unique=True, max_length=100)),
                ('description', models.TextField(help_text=b'Description for the perpetrator.', blank=True)),
                ('icon', models.ImageField(help_text=b'The icon for the perpetrator.', upload_to=b'perpetrator_icon', blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Victim',
            fields=[
                ('slug', models.SlugField(unique=True, serialize=False, primary_key=True)),
                ('name', models.CharField(help_text=b'A name for the victim.', unique=True, max_length=100)),
                ('description', models.TextField(help_text=b'Description for the victim.', blank=True)),
                ('icon', models.ImageField(help_text=b'The icon for the victim.', upload_to=b'victim_icon', blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='event',
            name='perpetrator',
            field=models.ForeignKey(verbose_name=b'Perpetrator', to='event_mapper.Perpetrator', help_text=b'The perpetrator of the event.'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='event',
            name='reported_by',
            field=models.ForeignKey(verbose_name=b'Event Reporter', to=settings.AUTH_USER_MODEL, help_text=b'The user who reports the event.'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='event',
            name='type',
            field=models.ForeignKey(verbose_name=b'Event Type', to='event_mapper.EventType', help_text=b'The type of the event.'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='event',
            name='victim',
            field=models.ForeignKey(verbose_name=b'Victim', to='event_mapper.Victim', help_text=b'The victim of the event.'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='user',
            name='countries_notified',
            field=models.ManyToManyField(help_text=b'The countries that user wants to be notified.', to='event_mapper.Country', verbose_name=b'Notified countries'),
            preserve_default=True,
        ),
    ]
