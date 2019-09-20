This repository contains the examples for customized search boxes from the talk
["Customizing Search for Special-Interest Maps"](https://2019.stateofthemap.org/sessions/PJE8GK/)
held during State-Of-The-Map 2019 in Heidelberg.

# Scenario #

We create a toy website "Pick-a-Peak" that allows to explore mountain tops all
over the planet. For this we've create a simple mock-up containing:

* a standard OpenStreetMap base map (created with [Leaflet](https://leafletjs.com/))
* a simple vector layer that highlights all OpenStreetMap objects tagged
  with `natural=peak` and `natural=volcano` (displayed with [Leaflet.VectorGrid](https://github.com/Leaflet/Leaflet.VectorGrid))
* a search box (via the Leaflet plugin [Leaflet-control-geocoder](https://github.com/perliedman/leaflet-control-geocoder))

# Installation #

The repository contains all necessary dependencies to run the examples. Just
download the repository and run the `index.html` file in your favourite browser.
If it gives you trouble with cross-origin sources, you may need to serve the
directory through a web server. You can use the simple HTTP server built into
Python, for example. From the base directory, just run:

```
python3 -m http.server
```

Then point your browser to `http://localhost:8000`.

The examples for SQLite and PostgreSQL need some additional setup which is
explained in the READMEs of the relevant example directories.

## Creating the example vector layer ##

The examples on the slides contain an additional vector layer that shows the
mountain peaks as little red dots. This layer is not really necessary for the
search functionality. You can run the examples without it. Simply ignore the
errors from `leaflet.vectorgrid.js`.

If you want to add the layer you need to install:

* [osmium-tool](https://github.com/osmcode/osmium-tool)
* [tippecanoe](https://github.com/mapbox/tippecanoe)

Then follow these steps:

* Extract peaks from the OSM planet or an abstract as pbf

   osimum tags-filter planet.osm.pbf natural=peak,volcano -o peaks.pbf

* Convert the peaks to geojson

   osmium export --geometry-types=point -o peaks.json -f geojson peaks.pbf

* Create vector tiles

   ./tippecanoe --no-tile-compression -f -z 13 -B 14 -rg -as -e data/tiles peaks.json

# License #

All examples are released as CC0 to the public domain. Please feel free to do
whatever you want with it. Libraries in `contrib/` have the licenses of the
respective projects.
