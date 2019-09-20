osmium export -u type_id -f pg -o /tmp/peaks.sql peaks.pbf
createdb peaks

psql peaks

> create table peaks (id text, geom GEOMETRY, tags JSONB);
> \copy peaks from '/tmp/peaks.sql';

> create extension unaccent;
> create extension pg_trgm;
> create table search as select id, ele, geom, tags->>'name' as name, unaccent(tags->>
'name') as terms from peaks where tags ? 'name';
> create index term_idx on search using gist(terms gist_trgm_ops);
