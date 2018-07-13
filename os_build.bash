#!/bin/bash

# exit after a command fails
set -e

IMAGE_SUFFIX=`sed "s/\./-/g" <<< "$1"`

sudo mkosi -o waterboard-$IMAGE_SUFFIX --force
