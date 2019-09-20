var GeocodeHelpers = {
    // Create a simple map with an OSM Mapnik base layer and an overlay of
    // vector tiles.
    createBaseMap : function() {
        var map = L.map('map', {zoomControl : false}).setView([50, 20], 5);
        var hash = new L.Hash(map);
        var unique_id_counter = 0;

        L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: "(C) OpenStreetMap and contributors"
        }).addTo(map);

        L.vectorGrid.protobuf("../data/tiles/{z}/{x}/{y}.pbf", {
            rendererFactory: L.canvas.tile,
            vectorTileLayerStyles: {
                "peaks": function(properties, zoom) {
               return {
                  weight: 0,
                  color: 'black',
                  opacity: 1,
                  fillColor: 'brown',
                  fill: true,
                  radius: 2,
                  fillOpacity: 0.7
               }
            }
            },
            maxNativeZoom: 13,
         getFeatureId: function(f) {
             if (!f.properties._unique_id) {
                 f.properties._unique_id = unique_id_counter;
                 unique_id_counter++;
             }
             return f.properties._unique_id;
         }
        })
        .addTo(map);

        return map;
    },

    formatNominatim : function (r) {
        var parts = r.display_name.split(',');
        return GeocodeHelpers._format(parts, r['class'], r['type']);
    },

    formatPhoton : function (r) {
        var parts = ['name', 'street', 'suburb', 'hamlet', 'town', 'city', 'state', 'country']
            .map(function(p) { return r.properties[p]; })
            .filter(function(v) { return !!v; });
        return GeocodeHelpers._format(parts, r.properties.osm_key, r.properties.osm_value);
    },

    _format : function(parts, k, v) {
        return '<b>' + parts[0] + '</b><br/>' + parts.slice(1).join(', ')
               + '<br/><small><i>' + k + '=' + v  + '</i></small>';
    },

    // Function to sort OSM objects by the ele tag.
    sortByEle : function (a, b) {
         var aele = parseInt(a.tags.ele) || 0;
         var bele = parseInt(b.tags.ele) || 0;
         return bele - aele;
    }
};


