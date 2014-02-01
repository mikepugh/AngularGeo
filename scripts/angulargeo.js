/**
 * Created by Mike on 1/31/14.
 */

(function() {
    "use strict";

    var angularGeo = angular.module('angular-geo', []);

    function angularGeoConfig() {
        var geoConfig = {
            providers: []
        };
        this.addProvider = function addProvider(provider, config) {
            provider.configure(config);
            geoConfig.providers.push({$$provider: provider, $$config: config});
            return this;
        };
        this.$get = function $get() {
            return geoConfig;
        }
    }


    angularGeo.provider('angularGeoConfig', angularGeoConfig);
    angularGeo.factory('angularGeo', function($log, $q, $timeout, $rootScope, angularGeoConfig) {
        var $$supportsGeolocation = 'geolocation' in navigator;
        var $$watchId;
        var $$providers = angularGeoConfig.providers;
        if($$providers.length === 0) {
            $log.error('No providers');
            throw new Error("AngularGeo requires at least 1 geo provider");
        }
        var $$currentProvider = 0;

        var $$geocode = function(address, bounds, region, restrictions, filters, promise) {
            var self = this;
            var deferred = promise || $q.defer();
            var p = $$providers[$$currentProvider].$$provider.geocode(address, bounds, region, restrictions, filters);
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
                return self.geocode(address, bounds, region, restrictions, filters, deferred);
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
    });
}).call(this);
