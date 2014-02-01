/**
 * Created by Mike on 1/31/14.
 */

(function() {
    "use strict";
    angular.module('testAngularGeo', ['angular-geo','angular-geo-providers'])
        .config(function(angularGeoProvider, angularGeoGoogleProvider) {
            angularGeoGoogleProvider.config({'api_key': 'foobar'});
            angularGeoProvider
                .addProvider(angularGeoGoogleProvider.name);
        })
        .controller('AppCtrl', function($log, $scope, angularGeo) {
            $scope.address = '30 Rockefeller Plaza, New York, NY';
            $scope.geo = {};
            $scope.geocodeAddress = function() {
                angularGeo.geocode($scope.address).then(function(results) {
                   $scope.geo = results[0].geometry;
                }, function(err) {
                    $log.error(err);
                });
            }
        });
}).call(this);
