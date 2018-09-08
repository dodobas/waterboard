-- DROP SCHEMA IF EXISTS data CASCADE;
CREATE SCHEMA IF NOT EXISTS features;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE ch_type AS ENUM ('create', 'update', 'import', 'system');

CREATE TABLE features.changeset (
    id serial primary key,

    ts_created timestamp with time zone default now(),
    webuser_id integer not null,
    changeset_type ch_type not null default 'system'
);
