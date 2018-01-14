#!/bin/bash


# RUN SCRIPT AS SUDO

DB_NAME=hcid_dev
DB_USER=knek
# PGPASSWORD=pass1234
CONN_STR="psql -U $DB_USER --dbname=$DB_NAME -f"

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
    sudo -u postgres -c "$CONN_STR $file"
done
#  sudo -u postgres -c "$CONN_STR $file"
