FROM python:3.6-slim as base

ENV PYTHONUNBUFFERED 1

RUN mkdir /project

WORKDIR /project
ADD . /project

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev build-essential gdal-bin netcat libpcre3 libpcre3-dev \
    && pip install -r /project/REQUIREMENTS-dev.txt


# service
FROM python:3.6-slim

ENV PYTHONUNBUFFERED 1

RUN mkdir /project

WORKDIR /project
ADD . /project

COPY --from=base /root/.cache /root/.cache

RUN apt-get update \
    && apt-get install -y --no-install-recommends gdal-bin netcat libpcre3 mime-support \
    && pip install -r /project/REQUIREMENTS-dev.txt \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

RUN python manage.py collectstatic --settings=core.settings.build --noinput -c
