/**
 * Created by Mike on 1/31/14.
 */

(function() {
  "use strict";

  var angularGeo = angular.module('angular-geo', []);
  angularGeo.constant('angularGeo_msgs', {
    'errors.unsupportedBrowser':'Browser geolocation not supported',
    'errors.noServices':'angularGeo could not locate any of the geo providers specified, verify that you have them properly linked',
    'errors.noProviders':'angularGeo requires at least one geo provider'
  });
  angularGeo.provider('angularGeo', function () {
    var $$geoConfig = {
      providerSvcNames: [],
      providers: []
    };
    var $$supportsGeolocation = false;
    var $$watchId;
    var $$currentProvider = 0;

    return {
      addProvider: function (providerSvcName) {
        $$geoConfig.providerSvcNames.push(providerSvcName);
        return this;
      },
      $get: function angularGeo($log, $q, $timeout, $rootScope, $injector, $window, angularGeo_msgs) {

        $$supportsGeolocation = 'geolocation' in $window.navigator;

        if($$geoConfig.providerSvcNames.length === 0) {
          throw new Error(angularGeo_msgs.errors.noProviders);
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
          throw new Error(angularGeo_msgs.errors.noServices);
        }

        var $$geocode = function(address, bounds, region, restrictions, filters, promise) {
          var deferred = promise || $q.defer();
          var p = $$providers[$$currentProvider].geocode(address, bounds, region, restrictions, filters);
          p.then(function(results) {
            deferred.resolve(results);
          }, function(err) {
            if($$providers.length === 1) {
              deferred.reject(err);
              return;
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

        var $$reverseGeo = function(latLng, bounds, region, restrictions, filters, promise) {
          var deferred = promise || $q.defer();
          var p = $$providers[$$currentProvider].reverseGeocode(latLng, bounds, region, restrictions, filters);
          p.then(function(results) {
            deferred.resolve(results);
          }, function(err) {
            if($$providers.length === 1) {
              deferred.reject(err);
              return;
            }
            if($$currentProvider < $$providers.length - 1) {
              $$currentProvider++;
            } else {
              $$currentProvider = 0;
            }
            return $$reverseGeo(latLng, bounds, region, restrictions, filters, deferred);
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
              throw new Error(angularGeo_msgs.errors.unsupportedBrowser);
            }
            var deferred = $q.defer();
            $window.navigator.geolocation.getCurrentPosition(function(pos) {
              if(autoReverseGeocode) {
                var p = $$reverseGeo({latitude: pos.coords.latitude, longitude: pos.coords.longitude}, null, null, null, null);
                p.then(function(results) {
                  deferred.resolve(results);
                }, function(err) {
                  deferred.reject(err);
                });
              } else {
                deferred.resolve(pos);
              }
            }, function(err) {
              deferred.reject(err);
            }, options);
            return deferred.promise;
          },
          watchPosition: function(options) {
            var self = this;
            if(!$$supportsGeolocation) {
              throw new Error(angularGeo_msgs.errors.unsupportedBrowser);
            }
            var deferred = $q.defer();
            $$watchId = $window.navigator.geolocation.watchPosition(function(pos) {
              $rootScope.$broadcast("angulargeo:watchposition", pos);
            }, function(err) {
              deferred.reject(err);
            }, options);
            return deferred.promise;

          },
          clearWatch: function() {
            if(!$$supportsGeolocation) {
              throw new Error(angularGeo_msgs.errors.unsupportedBrowser);
            }
            $window.navigator.geolocation.clearWatch($$watchId);
          }
        }
      }
    }
  });
}).call(this);
