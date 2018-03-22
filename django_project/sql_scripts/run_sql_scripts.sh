#!/bin/bash

# RUN SCRIPT AS SUDO

DB_NAME=waterboard
DB_USER=knek
DB_HOST=127.0.0.1
DB_PORT=5445
PG_PASS='knek'

export PGPASSWORD='knek'
#
#cp /home/kknezevic/TigrayWaterBoards_Points.csv /tmp/TigrayWaterBoards_Points.csv
#chmod 755 /tmp/TigrayWaterBoards_Points.csv
#




psql -U $DB_USER -h $DB_HOST --port $DB_PORT --dbname 'postgres' <<EOF
drop database waterboard;
create database waterboard;
EOF


#
source /home/kknezevic/venv/hcid_env/bin/activate
cd /home/kknezevic/waterboard/django_project
python manage.py migrate --settings=core.settings.dev_kknezevic

url=/home/kknezevic/hcid_dev/django_project/sql_scripts/00_import_raw_data_tigray.sql

psql -U $DB_USER -h $DB_HOST --port $DB_PORT --dbname $DB_NAME -f  /home/kknezevic/hcid_dev/django_project/sql_scripts/00_import_raw_data_tigray.sql



psql -U $DB_USER -h $DB_HOST --port $DB_PORT --dbname $DB_NAME <<EOF
\timing
\i /home/kknezevic/hcid_dev/django_project/sql_scripts/10_features_schema.sql
\i /home/kknezevic/hcid_dev/django_project/sql_scripts/20_core_utils_schema.sql
\i /home/kknezevic/hcid_dev/django_project/sql_scripts/30_load_data.sql
\i /home/kknezevic/hcid_dev/django_project/sql_scripts/40_simulate_history_data.sql
EOF
