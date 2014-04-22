/**
 * Created by Mike on 1/31/14.
 */

(function() {
  "use strict";
  angular.module('testAngularGeo', ['angular-geo','angular-geo-providers.google', 'angular-geo-providers.bing'])
    .config(function(angularGeoProvider, angularGeoGoogleProvider, angularGeoBingProvider) {
      angularGeoGoogleProvider.config({'apiKey': 'foobar'});
      angularGeoBingProvider.config({'apiKey': 'Apd4QRLTWF8Vu5fmRxjYkEPsAgTynSqn_n3bQOHguzS2iXam5FTkSBEouc1aBxpn'});

      angularGeoProvider
        .addProvider(angularGeoGoogleProvider.name)
        .addProvider(angularGeoBingProvider.name);
    })
    .controller('AppCtrl', function($log, $scope, angularGeo) {
      $scope.address = '30 Rockefeller Plaza, New York, NY';
      $scope.geo = {};
      $scope.geocodeAddress = function() {
        angularGeo.geocode($scope.address).then(function(results) {
          $scope.geo = results;
        }, function(err) {
          $log.error(err);
        });
      };
      $scope.getLocation = function() {
        angularGeo.getCurrentPosition({},true).then(function(results) {
          $scope.geo = results;
        }, function(err) {
          $log.error(err);
        })
      }

    });
}).call(this);
