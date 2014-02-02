/**
 * Created by Mike on 2/02/14.
 */
(function() {
  "use strict";
  angular.module('angular-geo-providers.bing', [])
    .provider('angularGeoBing', function() {
      var $$q, $$log;
      var $$configuration = {};
      var $$http;

      var $$geoEndpoint = "https://dev.virtualearth.net/REST/v1/Locations?q={0}&key={1}&jsonp=JSON_CALLBACK";
      var $$rgeoEndpoint = "https://dev.virtualearth.net/REST/v1/Locations/{0}&key={1}&jsonp=JSON_CALLBACK";

      var svc = {
        geocode: function(address, bounds, region, restrictions, filters) {
          var deferred = $$q.defer();
          var httpPromise = $$http.jsonp($$geoEndpoint.replace("{0}", address));
          httpPromise.success(function(data, status, headers, config) {
            deferred.resolve(data);
          })
            .error(function(data, status, headers, config) {
              deferred.reject({data: data, status: status});
            });

          return deferred.promise;
        },
        reverseGeocode: function(latLng, bounds, region, restrictions, filters) {

        }
      };
      return {
        name: 'angularGeoBing',
        config: function(config) {
          $$configuration.apiKey = config.apiKey;
          $$geoEndpoint = $$geoEndpoint.replace("{1}", $$configuration.apiKey);
          $$rgeoEndpoint = $$rgeoEndpoint.replace("{1}", $$configuration.apiKey);
        },
        $get: function($log, $q, $http) {
          $$q = $q;
          $$log = $log;
          $$http = $http;
          return svc;
        }
      }
    });
}).call(this);
