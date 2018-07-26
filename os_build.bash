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

# update service release version in env_file
sed -i "s/SERVICE_RELEASE=.*/SERVICE_RELEASE=$1/g" os_build/mkosi.extra/srv/live/env_file


sudo mkosi -o waterboard.final --force

echo -n "Tar and compress (gzip) the ... waterboard.final ..."
sudo tar czf waterboard-$IMAGE_SUFFIX.tar.gz -C waterboard.final .
echo "done"
