# Welcome to the Watchkeeper code base!


# Status

These badges reflect the current status of our development branch:

Tests status: 

Coverage status: 

Development status: 

# License

Code: [Free BSD License](http://www.freebsd.org/copyright/freebsd-license.html)

Out intention is to foster wide spread usage of the data and the code that we
provide. Please use this code and data in the interests of humanity and not for
nefarious purposes.

# Installation

## Check out the source


First checkout out the source tree:

```
git clone git://github.com/kartoza/watchkeeper.git
```


## Instructions for deployment

You need to have http://docker.io and http://www.fig.sh/ installed first.

Note you need at least docker 1.5 - use
the [installation notes](http://docs.docker.com/installation/ubuntulinux/)
on the official docker page to get it set up.

Please read instructions in deployment/README-docker.md for more information.


# Instructions for developers

# Install dependencies



**OSX** Specific notes:

* Download Postgresql.app from http://postgresapp.com/
* Open the psql prompt and do
  * `create database gis;
  * `connect gis;`
  * `CREATE EXTENSION postgis;`
* Install xcode
* Install pip (sudo easy_install pip)
* Install virtualenv (sudo pip install virtualenv)
* ``export PATH=$PATH:/Applications/Postgres.app/Contents/Versions/9.4/bin/``

**All platforms**:

```
mkdir /tmp/media
mkdir /tmp/static
virtualenv venv
source venv/bin/activate
pip install -r REQUIREMENTS.txt
```

### Create your dev profile


```
cd django_project/core/settings
cp dev_timlinux.py dev_${USER}.py
```

Now edit ``dev_<your username>`` setting your database connection details as
needed. We assume you have created a postgres (with postgis extentions)
database somewhere that you can use for your development work. See
[http://postgis.net/install/](http://postgis.net/install/) for details on doing
that.

## Running migrate, collect static, and development server

Prepare your database and static resources by doing this:

```
virtualenv venv
source venv/bin/activate
cd django_project
python manage.py migrate --settings=core.settings.dev_${USER}
python manage.py collectstatic --noinput --settings=core.settings.dev_${USER}
python manage.py runserver --settings=core.settings.dev_${USER}
python manage.py createsuperuser --settings=core.settings.dev_${USER}

```
