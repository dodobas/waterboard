#!/usr/bin/env bash

# Usage: $ PGPASSWORD=some_password ./reflash_db

export PGHOST=localhost
export PGPORT=5432
export PGUSER=some_user
export PGDATABASE=waterboard_dev

export DJANGO_SETTINGS_MODULE=core.settings.dev_dodobas


dropdb $PGDATABASE || exit 1
createdb $PGDATABASE

cd django_project
python manage.py migrate

psql -f sql_scripts/00_import_raw_data_tigray.sql
psql -f sql_scripts/10_features_schema.sql
psql -f sql_scripts/20_core_utils_schema.sql
psql -f sql_scripts/22_core_load_attribute.sql
psql -f sql_scripts/25_core_utils_dashboard.sql
psql -f sql_scripts/30_load_data.sql
psql -f sql_scripts/40_simulate_history_data.sql
