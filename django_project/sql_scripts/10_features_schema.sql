-- DROP SCHEMA IF EXISTS data CASCADE;
CREATE SCHEMA IF NOT EXISTS features;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE features.changeset (
    id serial primary key,

    ts_created timestamp with time zone default now(),
    webuser_id integer not null,
    changeset_type text default 'U', -- 'S'ystem, 'U'ser, 'I'mport
    metadata jsonb
);
