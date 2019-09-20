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
    var q = Object.keys(this.options.keywords).find(k => query.startsWith(k));
    if (typeof q === 'undefined')
      return;
    var tag = this.options.keywords[q];
    var searchterm = query.substring(q.length);

    $.getJSON(
      this.options.geocoderUrl + '/search',
      { q : searchterm, format : 'jsonv2' },
      L.bind(function(data) {
        var res = data.find(e => e.place_rank > 10);
        if (typeof res === 'undefined') {
          cb.call(context, []);
          return;
        }
        var area;
        if (res.osm_type == 'relation')
          area = '(area:' + (3600000000 + res.osm_id) + ')';
        else
          area = '(around:1000,' + res.lat + ',' + res.lon + ')';

        $.getJSON(
          this.options.serviceUrl,
          { data: '[out:json][timeout:10];(node["' + tag[0] + '"="' + tag[1]
                    + '"]'+ area + ';);out;>;out skel qt;' },
          L.bind(this._lookup_overpass_address, this, cb, context)
        );
      }, this)
    );
  },

  _lookup_overpass_address : function (cb, context, data) {
    var ele = data.elements;
    ele = ele.sort(this.options.sortResults);
    ele = ele.slice(0, 10);
    var ids = ele.map(e => 'N' + e.id).join(',');
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
  }
});
