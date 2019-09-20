-- Create a table that supports full-text search.
-- Only make the term column searchable, the rest is for info.
CREATE VIRTUAL TABLE search using FTS5(id UNINDEXED, kind UNINDEXED, term);

-- import the CSV data.
.mode csv
.import ../data/route_names.csv search

-- Query using MATCH operator. bm25() tells something about how well it matched
SELECT bm25(search), id, term from search WHERE term MATCH 'limesweg*' order by rank limit 20;
