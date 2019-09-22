This example shows how to build a simple search interface using
PostgreSQL's trigram indexing facility.

## Creating the Database ##

### Extracting the Base Data ###

The example assumes that you have your data in a PostgreSQL database
already. So for the example we can just create a small database with
mountain peaks from the planet (or if you prefer a small extract).

Start with the `peaks.pbf` already created for the vector tile layer
(see README in the root directory). From this you can quickly import
the peans with osmium-tool using its geojson converter:

```
osmium export -u type_id -f pg -o /tmp/peaks.sql peaks.pbf
createdb peaks12
psql -d peaks12 -c "CREATE EXTENSION postgis"
psql -d peaks12 -c "CREATE TABLE peaks (id text, geom GEOMETRY, tags JSONB)"
psql -d peaks12 -c "\copy peaks from '/tmp/peaks.sql'"
```

### Creating the Search Table ###

Now you can create the search table as explained in the slides.

```
psql -d peaks12 -c "CREATE EXTENSION unaccent"
psql -d peaks12 -c "CREATE EXTENSION pgtrgm"
psql -d peaks12 -c "CREATE TABLE search AS select id, geom, tags->>'ele' as ele, tags->>'name' as name, unaccent(tags->>'name') as terms from peaks where tags ? 'name'"
psql -d peaks12 -c "CREATE INDEX term_idx on search using gist(terms gist_trgm_ops)"
```

## Serving the Data ##

There is a simple Python script that serves the data using
[hug](http://www.hug.rest). You can simply install this in a virtual
environment for testing:

```
virtualenv -p python3 venv
. venv/bin/activate
```

Now you can use the `search.py` script to start a small webserver that
serves the data from your database:

```
hug -p 8003 -f search.py
```
