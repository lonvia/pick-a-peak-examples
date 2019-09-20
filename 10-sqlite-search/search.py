#!/usr/bin/python3
import hug
import sqlite3

api = hug.API(__name__)
api.http.add_middleware(hug.middleware.CORSMiddleware(api, max_age=10))

db = sqlite3.connect('search.sqlite')
db.isolation_level = None

def sqlite_search(query, limit):
    search_sql = "SELECT id, ele, term, bm25(search) as importance FROM search WHERE term MATCH ? order by rank limit ?"
    if limit > 50:
        limit = 50

    res = db.execute(search_sql, (query, limit))

    results = [{'id' : r[0],
                'name' : r[2],
                'ele' : r[1],
                'importance' : r[3]} for r in res]

    return {'query' : query, 'results' : results}


@hug.get()
def search(query, limit:hug.types.greater_than(0)=20):
    return sqlite_search(query, limit)

@hug.get()
def complete(query, limit:hug.types.greater_than(0)=20):
    return sqlite_search(query + '*', limit)
