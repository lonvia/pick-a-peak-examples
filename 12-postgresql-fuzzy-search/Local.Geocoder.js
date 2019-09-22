L.Control.Geocoder.LocalSearch = L.Class.extend({
  options: {
    serviceUrl: 'http://localhost:8003',
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
    $.getJSON(
      this.options.serviceUrl + '/search',
      { query : query, limit : 10 },
      L.bind(this._lookup_address, this, cb, context)
    );
  },

  suggest: function(query, cb, context) {
    $.getJSON(
      this.options.serviceUrl + '/complete',
      { query : query, limit : 20 },
      /*L.bind(function (data) {
          var results = data.results
              .filter(function (e, index) {
                  return index == data.results.findIndex(o => o.name == e.name);
              })
              .map(function (e) {
                  return { name : e.name, properties : e };
              });
          cb.call(context, results);
      }, this)*/
      L.bind(this._lookup_address, this, cb, context)
    );
  },

  _lookup_address : function (cb, context, data) {
    var ele = data.results;
    ele = ele.sort(this.options.sortResults);
    var ids = ele.map(e => e.id.toUpperCase()).join(',');
    $.getJSON(
      this.options.geocoderUrl + '/lookup',
      { osm_ids : ids, format : 'json' },
      L.bind(function(data) {
        var ht = this.options.htmlTemplate;
        var results = ele.map(function (r) {
          var geocode = data.find(e => e.osm_id == r.id.slice(1));
          if (typeof geocode === 'undefined')
            return undefined;

          return {
            icon: geocode.icon,
            name: geocode.display_name,
            html: ht ? ht(geocode) : undefined,
            bbox: L.latLng(geocode.lat, geocode.lon).toBounds(1000),
            center: L.latLng(geocode.lat, geocode.lon),
            properties: geocode
          };
        });
        cb.call(context, results);
      }, this)
    );
  }
});
