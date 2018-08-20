#!/usr/bin/env bash

# The usual way, setup env

set -ae
source /srv/live/env_file
set +a

# actual update process

cd /srv/live/django_project

python3 manage.py migrate --settings=core.settings.prod
