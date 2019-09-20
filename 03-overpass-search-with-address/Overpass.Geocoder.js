L.Control.Geocoder.Overpass = L.Class.extend({
  options: {
    serviceUrl: 'https://overpass-api.de/api/interpreter',
    geocoderUrl: 'https://nominatim.openstreetmap.org',
    geocodingQueryParams: {},
    reverseQueryParams: {},
    keywords : {},
    sortResults: function (a, b) {
      var aname = a.tags.name || '';
      var bname = b.tags.name || '';
      return aname.localeCompare(bname);
    }
  },

  initialize: function(options) {
    L.Util.setOptions(this, options);
  },

  geocode: function(query, cb, context) {
    var tag = this.options.keywords[query];
    if (typeof tag === 'undefined')
      return;

    var b = map.getBounds();
    // Overpass is rather slow returning results for larger areas.
    // If the current view is to large, just query the objects around the center.
    if (b.getNorth() - b.getSouth() > 2)
      b = b.getCenter().toBounds(20000);

    var s = [b.getSouth(), b.getWest(), b.getNorth(),b.getEast()].join(',');
    // First pass: get the interesting objects from Overpass API.
    $.getJSON(
      this.options.serviceUrl,
      { data: '[out:json][timeout:25];(node["' + tag[0] + '"="' + tag[1]
                + '"]('+ s + '););out;>;out skel qt;' },
      L.bind(function(data) {
        var ele = data.elements;
        ele.sort(this.options.sortResults);
        ele = ele.slice(0, 10);
        var ids = ele.map(e => 'N' + e.id).join(',');
        // Second pass: ask Nominatim for the addresses of the 10 most
        //              interesting results, so that we can present them
        //              in a more readable way.
        $.getJSON(
          this.options.geocoderUrl + '/lookup',
          { osm_ids : ids, format : 'json' },
          L.bind(function(data) {
            var ht = this.options.htmlTemplate;
            var results = ele.map(function (r) {
              var geocode = data.find(e => e.osm_id == r.id);
              if (typeof geocode === 'undefined')
                return undefined;

              return {
                icon: geocode.icon,
                name: geocode.display_name,
                html: ht ? ht(geocode) : undefined,
                bbox: L.latLng(r.lat, r.lon).toBounds(1000),
                center: L.latLng(r.lat, r.lon),
                properties: geocode
              };
            });
            cb.call(context, results);
          }, this)
        );
      }, this)
    );
  },

});
