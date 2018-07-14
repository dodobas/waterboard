#!/bin/bash

# exit after a command fails
set -e

# checkout the specific tag
git checkout $1

IMAGE_SUFFIX=`sed "s/\./-/g" <<< "$1"`

sudo mkosi -o waterboard-$IMAGE_SUFFIX --force
