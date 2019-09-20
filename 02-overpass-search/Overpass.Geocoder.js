L.Control.Geocoder.Overpass = L.Class.extend({
  options: {
    serviceUrl: 'https://overpass-api.de/api/interpreter',
    keywords: {}
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
    $.getJSON(
      this.options.serviceUrl,
        { data: '[out:json][timeout:25];(node["' + tag[0] + '"="' + tag[1]
                + '"]('+ s + '););out;>;out skel qt;'
        },
      L.bind(function(data) {
        var ele = data.elements;
        var results = [];
        for (var i = ele.length - 1; i >= 0; i--) {
          results[i] = {
            name: ele[i].tags.name,
            center: L.latLng(ele[i].lat, ele[i].lon),
            bbox: L.latLngBounds([ele[i].lat - 0.1, ele[i].lon - 0.1],
                                 [ele[i].lat + 0.1, ele[i].lon + 0.1]),
            properties: ele[i]
          };
        }
        cb.call(context, results);
      }, this)
    );
  },

});
