/**
 * Created by Mike on 1/31/14.
 */
(function() {
  "use strict";
  angular.module('angular-geo-providers.google', [])
    .provider('angularGeoGoogle', function() {
      var $$q, $$log;
      var $$configuration;

      if(typeof google === 'undefined' || (typeof google !== 'undefined' && typeof google.maps === 'undefined')) {
        throw new Error("Google Maps API V3 is required for angulargeo-google to function, please include it");
      }
      var $$geocoder = new google.maps.Geocoder();
      var svc = {
        geocode: function(address, bounds, region, restrictions, filters) {
          var deferred = $$q.defer();
          $$geocoder.geocode({'address': address}, function(results, status) {
            if(status === google.maps.GeocoderStatus.OK) {
              var _res = {};
              _res.length = results.length;
              _res.results = [];
              _res.source = 'googleV3';
              _res.nativeResponse = results;

              angular.forEach(results, function (value, key) {
                var _tmp = {
                  address: {},
                  geometry: {
                    coords: {
                      latitude: value.geometry.location.lat(),
                      longitude: value.geometry.location.lng()
                    },
                    viewPort: {
                      southWest: {
                        latitude: value.geometry.viewport.getSouthWest().lat(),
                        longitude: value.geometry.viewport.getSouthWest().lng()
                      },
                      northEast: {
                        latitude: value.geometry.viewport.getNorthEast().lat(),
                        longitude: value.geometry.viewport.getNorthEast().lng()
                      }
                    }
                  }
                };
                angular.forEach(value.address_components, function (value, key) {
                  switch(value.types[0]) {
                    case "street_number":
                      _tmp.address.street_number = value.long_name;
                      break;
                    case "route":
                      _tmp.address.street = value.long_name;
                      break;
                    case "locality":
                      _tmp.address.locality = value.long_name;
                      break;
                    case "administrative_area_level_2":
                      _tmp.address.adminDistrict2 = value.long_name;
                      break;
                    case "administrative_area_level_1":
                      _tmp.address.adminDistrict1 = value.long_name;
                      break;
                    case "country":
                      _tmp.address.country = value.long_name;
                      break;
                    case "postal_code":
                      _tmp.address.postalCode = value.long_name;
                      break;
                  }
                });
                _tmp.address.full = value.formatted_address;
                _res.results.push(_tmp);
              });

              deferred.resolve(_res);
            } else if(status === google.maps.GeocoderStatus.ZERO_RESULTS) {
              deferred.resolve(null);
            } else if(status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
              deferred.reject("OVER_LIMIT")
            } else if(status === google.maps.GeocoderStatus.REQUEST_DENIED || status === google.maps.GeocoderStatus.INVALID_REQUEST) {
              deferred.reject("FAILED");
            }
          });
          return deferred.promise;
        },
        reverseGeocode: function(latLng, bounds, region, restrictions, filters) {
          var deferred = $$q.defer();
          $$geocoder.geocode({'latLng': new google.maps.LatLng(latLng.latitude, latLng.longitude)}, function(results, status) {
            if(status === google.maps.GeocoderStatus.OK) {
              //todo: Normalize result set once we have a better idea what bing, etc apis return
              deferred.resolve(results);
            } else if(status === google.maps.GeocoderStatus.ZERO_RESULTS) {
              deferred.resolve(null);
            } else if(status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
              deferred.reject("OVER_LIMIT")
            } else if(status === google.maps.GeocoderStatus.REQUEST_DENIED || status === google.maps.GeocoderStatus.INVALID_REQUEST) {
              deferred.reject("FAILED");
            }
          });
          return deferred.promise;
        }
      };
      return {
        name: 'angularGeoGoogle',
        config: function(config) {
          // do some config? set api-key?

        },
        $get: function($log, $q) {
          $$q = $q;
          $$log = $log;
          return svc;
        }
      }
    });
}).call(this);
