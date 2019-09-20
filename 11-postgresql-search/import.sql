osmium export -u type_id -f pg -o /tmp/peaks.sql peaks.pbf
createdb peaks11

psql peaks11

> create extension postgis;
> create table peaks (id text, geom GEOMETRY, tags JSONB);
> \copy peaks from '/tmp/peaks.sql';

> create extension unaccent;
> create table search as select id, geom, tags->>'ele'as ele, tags->>'name' as name, to_tsvector('simple', unaccent(tags->>
'name')) as terms from peaks where tags ? 'name';
> create index term_idx on search using gin(terms);
