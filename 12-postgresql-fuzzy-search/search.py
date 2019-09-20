#!/usr/bin/python3
import hug
import psycopg2

api = hug.API(__name__)
api.http.add_middleware(hug.middleware.CORSMiddleware(api, max_age=10))

db = psycopg2.connect('dbname=peaks12')
db.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)

def pg_search(query, limit):
    search_sql = "SELECT id, ele, name FROM search WHERE terms %% unaccent(%s) order by terms <-> unaccent(%s) limit %s"
    if limit > 50:
        limit = 50

    q = " & ".join(query.split())

    cur = db.cursor()
    cur.execute(search_sql, (q, q, limit))

    results = [{'id' : r[0],
                'name' : r[2],
                'ele' : r[1]} for r in cur]

    return {'query' : query, 'results' : results}


@hug.get()
def search(query, limit:hug.types.greater_than(0)=20):
    return pg_search(query, limit)

@hug.get()
def complete(query, limit:hug.types.greater_than(0)=20):
    if not query.endswith(' '):
        query += ':*'
    return pg_search(query, limit)
