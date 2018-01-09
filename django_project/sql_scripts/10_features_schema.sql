-- DROP SCHEMA IF EXISTS data CASCADE;
CREATE SCHEMA IF NOT EXISTS features;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE features.changeset (
    id serial primary key,

    ts_created timestamp with time zone default now(),
    webuser_id integer not null
);

CREATE TABLE features.feature (
    feature_uuid uuid not null,
    point_geometry GEOMETRY(Point, 4326) NOT NULL,
    changeset_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    upstream_id integer
);

alter table features.feature
    add primary key (feature_uuid, changeset_id);

create index ix_feature_pk
    on
        features.feature
        using
        btree (feature_uuid, changeset_id);

CREATE INDEX ix_feature_point_geometry
    ON features.feature (point_geometry);

CREATE TABLE features.feature_attribute_value
(
    id serial,

    val_text character varying(32),
    val_int int,
    val_real numeric(9,2),

    feature_uuid uuid NOT NULL,
    attribute_id integer NOT null,
    changeset_id integer NOT NULL,

    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    ts timestamp with time zone default now()
);

alter table features.feature_attribute_value
    add primary key (feature_uuid, attribute_id, changeset_id);

create index ix_feature_attributes_value_pk
    on
        features.feature_attribute_value
        using
        btree (feature_uuid, attribute_id, changeset_id);
