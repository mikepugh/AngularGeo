/**
 * Created by Mike on 1/31/14.
 */

(function() {
    "use strict";
    angular.module('testAngularGeo', ['angular-geo','angular-geo-providers'])
        .config(function(angularGeoConfigProvider, angularGeoGoogleProvider) {
            angularGeoConfigProvider
                .addProvider(angularGeoGoogleProvider.base, {api_key: 'abcdefghi'});
            //    .addProvider(angularGeoBing.base, {api_key: 'foobar'});
        })
        // needed to have angular call the $get method of the provider, and populate required $q and $log services
        .run(function(angularGeoGoogle) {

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
