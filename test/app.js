/**
 * Created by Mike on 1/31/14.
 */

(function() {
    "use strict";
    angular.module('testAngularGeo.services', ['angularGeo'])
        .config(function(angularGeoConfig, angularGeoGoogle, angularGeoBing) {
            angularGeoConfig
                .addProvider(angularGeoGoogle.base, {api_key: 'abcdefghi'})
                .addProvider(angularGeoBing.base, {api_key: 'foobar'});
        })
        .controller('AppCtrl', function($log, $scope, angularGeo) {
            $scope.address = '30 Rockefeller Plaza, New York, NY';
            $scope.geo = {};
            $scope.geocodeAddress = function() {
                angularGeo.geocode(address).then(function(results) {
                   $scope.geo = results.geo;
                }, function(err) {
                    $log.error(err);
                });
            }
        });
}).call(this);
