AngularGeo
==========

Angular service for abstracting geolocation apis. Supports getting the current user's location from the browser, as well as geocoding/reverse geocoding lat/lng values.

[![Build Status](https://travis-ci.org/mikepugh/AngularGeo.svg?branch=master)](https://travis-ci.org/mikepugh/AngularGeo) [![Bower version](https://badge.fury.io/bo/angularGeo.svg)](http://badge.fury.io/bo/angularGeo)

Installation & Usage
====================

Install via bower or clone the repo locally

````
bower install angularGeo
````

Include the angularGeo script, along with the desired provider (and provider's scripts). For example, if you wanted to use Google Maps geolocation apis:

````javascript
<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
<script src="scripts/modules/angularGeo/angulargeo.js"></script>
<script src="scripts/modules/angularGeo/providers/angulargeo-google.js"></script>
````

Within your Angular app, you'll need to configure the angularGeo provider. Use the addProvider method, passing in the name of the service that angularGeo will be using. angularGeoGoogle and angularGeoBing expose providers that provide a name property to avoid hardcoded strings.

````javascript
angular.module('myApp', ['angular-geo','angular-geo-providers.google'])
    .config(function (angularGeoProvider, angularGeoGoogleProvider) {
        angularGeoProvider.addProvider(angularGeoGoogleProvider.name);
    });
    
````

Now, you can reference the angularGeo service to get the user's location and/or perform geocoding operations.

````javascript
angular.module('myApp')
    .controller('MyCtrl', function($scope, angularGeo) {
      angularGeo.getCurrentPosition().then(function (pos) {
        $scope.currentLocation = pos;
      });
      
      $scope.lookupAddress = function() {
        angularGeo.geocode($scope.address).then(function (results) {
          $scope.addresses = results;
        });
      }
    });
````

API
===

All methods that return data do so via AngularJS $q promises.

````javascript
geocode: function(address, bounds, region, restrictions, filters)
````
For the given address, retrieve the latitude/longitude. Currently, bounds, region, restrictions, and filters are being ignored but are left as placeholders for once the code is updated to support these parameters.

The promise is resolved with an array of matches from the configured provider(s).

````javascript
getCurrentPosition: function(options, autoReverseGeocode)
````
Uses the browser's geolocation api to get the user's current position. If autoReverseGeocode option is passed in as true, then angularGeo will automatically call the reverseGeocode method to try and resolve a known address from the configured provider(s). If false, then the promise shall resolve to the lat/lng based upon the browser. Note that the promise may be rejected if the end user does not give permission to use their current location.

````javascript
watchPosition: function(options)
````
Sets up a broadcast event named "angulargeo:watchposition" which will be invoked each time the navigator's geolocation is updated. The promise returned by this method is never resolved, but may be rejected if the end user does not give permission to use their current location. To obtain data, you'd need to setup a broadcast listener on "angulargeo:watchposition" and view the position object passed in.

````javascript
clearWatch: function()
````
Clears the watch created with watchPosition.

Current Status
==============
For now, I've only really fleshed out the Google provider and started on a Bing Maps provider. The eventual goal is to allow for multiple providers, such that if one should fail a request (perhaps due to request throttling) that the angularGeo service will immediately fall back to a backup provider and retry the request. 

Aside from retry/backup scenarios, the other goal is to unify the APIs since there are vast difference in the object models between Google, Bing, Yahoo, MapQuest, etc. This project will attempt to make it possible to swap providers without having to change any code.


License
=======

MIT
