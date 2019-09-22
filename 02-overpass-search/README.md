In this example we use the [Overpass API](https://overpass-api.de/) instead
of a traditional geocoder for searching. When the user types a generic term
like 'peaks' or 'volcanoes', it finds the highest peak or volcano in the
current view.

`Overpass.Geocoder.js` contains the custom geocoding plugin. It takes two
parameters. The `serviceUrl` takes the URL of the Overpass installation
(defaults to the official one). `keywords` takes a hash of hash of strings
that point to OSM key/value pairs. If in the query any of those matches,
then a query for the current bounding box is sent to Overpass asking for
nodes with the appropriate tagging within that box.
