#!/bin/bash

# exit after a command fails
set -e

if [ $# -eq 0 ] ; then
    echo 'Must specify a version for deploy'
    exit 1
fi

# checkout the specific tag
git checkout $1

IMAGE_SUFFIX=`sed "s/\./-/g" <<< "$1"`

sudo mkosi -o waterboard-$IMAGE_SUFFIX.img --force

echo -n "Compressing (gzip) the image...waterboard-$IMAGE_SUFFIX.img"
sudo gzip -k waterboard-$IMAGE_SUFFIX.img
echo "done"
