In this example, the data to be searched is saved in a SQLite database.

## Creating the Database ##

There is a CSV file with the example mountain peak data in `data/peaks.csv`.
Create a new SQLite database:

```
sqlite3 search.sqlite
```

and import the data with the following commands:

```
CREATE VIRTUAL TABLE search using FTS5(id UNINDEXED, ele UNINDEXED, term);
.mode csv
.import ../data/peaks.csv search
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
hug -p 8001 -f search.py
```
