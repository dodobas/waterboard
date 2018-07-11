#!/bin/bash

# exit after a command fails
set -e

# preapre git archive
git archive v0.1.1 -o live.tar

tar xf live.tar --keep-old-files -C mkosi.extra/srv/live/

rm live.tar

sudo mkosi -i -o waterboard-v0-1-1 --force
