/**
 * Created by Mike on 1/31/14.
 */

(function() {
  "use strict";

  var angularGeo = angular.module('angular-geo', []);
  angularGeo.provider('angularGeo', function() {
    var $$geoConfig = {
      providerSvcNames: [],
      providers: []
    };
    var $$supportsGeolocation = 'geolocation' in navigator;
    var $$watchId;
    var $$currentProvider = 0;

    return {
      addProvider: function (providerSvcName) {
        $$geoConfig.providerSvcNames.push(providerSvcName);
        return this;
      },
      $get: function ($log, $q, $timeout, $rootScope, $injector) {
        if($$geoConfig.providerSvcNames.length === 0) {
          throw new Error("AngularGeo requires at least 1 geo provider");
        }
        // Instantiate the geo providers and store them within the $$geoConfig object
        for(var i = 0; i < $$geoConfig.providerSvcNames.length; i++) {
          if(!$injector.has($$geoConfig.providerSvcNames[i])) {
            $log.error('angularGeo could not locate service ' + $$geoConfig.providerSvcNames[i]);
          } else {
            $$geoConfig.providers.push($injector.get($$geoConfig.providerSvcNames[i]));
          }
        }
        var $$providers = $$geoConfig.providers;
        if($$providers.length === 0) {
          throw new Error('angularGeo could not locate any of the geo providers specified, verify that you have them properly linked');
        }

        var $$geocode = function(address, bounds, region, restrictions, filters, promise) {
          var deferred = promise || $q.defer();
          var p = $$providers[$$currentProvider].geocode(address, bounds, region, restrictions, filters);
          p.then(function(results) {
            deferred.resolve(results);
          }, function(err) {
            if($$providers.length === 1) {
              deferred.reject(err);
            }
            if($$currentProvider < $$providers.length - 1) {
              $$currentProvider++;
            } else {
              $$currentProvider = 0;
            }
            return $$geocode(address, bounds, region, restrictions, filters, deferred);
          });
          return deferred.promise;
        };

        return {
          geocode: function(address, bounds, region, restrictions, filters) {
            return $$geocode(address, bounds, region, restrictions, filters, null);
          },
          reverseGeocode: function(latLng, bounds, region, restrictions, filters) {},
          getCurrentPosition: function(options, autoReverseGeocode) {
            var self = this;
            if(!$$supportsGeolocation) {
              throw new Error("Browser geolocation not supported");
            }
            var deferred = $q.defer();
            navigator.geolocation.getCurrentPosition(function(pos) {
              if(autoReverseGeocode) {
                var p = self.reverseGeocode({latitude: pos.coords.latitude, longitude: pos.coords.longitude}, null, null, null, null);
                p.then(function(results) {
                  deferred.resolve(results);
                }, function(err) {
                  deferred.reject(err);
                });
              }
              deferred.resolve(pos);
            }, function(err) {
              deferred.reject(err);
            }, options);
            return deferred.promise;
          },
          watchPosition: function(options) {
            var self = this;
            if(!$$supportsGeolocation) {
              throw new Error("Browser geolocation not supported");
            }
            var deferred = $q.defer();
            $$watchId = navigator.geolocation.watchPosition(function(pos) {
              $rootScope.$broadcast("angulargeo:watchposition", pos);
            }, function(err) {
              deferred.reject(err);
            }, options);
            return deferred.promise;

          },
          clearWatch: function() {
            if(!$$supportsGeolocation) {
              throw new Error("Browser geolocation not supported");
            }
            navigator.geolocation.clearWatch($$watchId);
          }
        }
      }
    }
  });
}).call(this);
