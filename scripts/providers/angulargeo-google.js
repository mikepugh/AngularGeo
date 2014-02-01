/**
 * Created by Mike on 1/31/14.
 */
(function() {
    "use strict";
    angular.module('angular-geo-providers', [])
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
                },
                reverseGeocode: function(latLng, bounds, region, restrictions, filters) {

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
