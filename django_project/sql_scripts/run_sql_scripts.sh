#!/bin/bash


# RUN SCRIPT AS SUDO

DB_NAME=hcid_dev
DB_USER=knek
DB_PORT=5434

CONN_STR="psql -U $DB_USER --port=$DB_port --dbname=$DB_NAME -f"

files=(
    "00_import_raw_data_tigray.sql"
    "10_features_schema.sql"
    "20_core_utils_schema.sql"
    "30_load_data.sql"
    "40_simulate_history_data.sql"
)
#
for file in ${files[*]}
do
    echo "[Import]: $file"
    result=$($CONN_STR $file)

    echo "$result"
done
#  sudo -u postgres -c "$CONN_STR $file"
