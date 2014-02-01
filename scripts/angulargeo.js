/**
 * Created by Mike on 1/31/14.
 */

(function() {
    "use strict";
    angular.module('angularGeo.providers',[]);

    angular.module('angularGeo', ['angularGeo.providers'])
        .provider('angularGeoConfig', function() {
            var config = {
                providers: []
            };

            this.addProvider = function(provider, config) {
                config.push({$$provider: provider, $$config: config});
            }

            this.$get = function $get() {
                return config;
            };

        })
        .service('angulargeo', function($log, $q, $timeout, $rootScope) {
            var $$supportsGeolocation = 'geolocation' in navigator;
            var $$watchId;

            return {
                geocode: function(address, bounds, region, restrictions, filters) {},
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
                    }, options)

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
