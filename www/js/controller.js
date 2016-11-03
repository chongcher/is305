angular.module('fitbyte.controllers', ['ionic','ngCordova'])

.controller('trackSensorDataController', function($scope, $state, $http, $q, $interval, $cordovaGeolocation){
    
    //triggers every 5 seconds
    $interval(function(){
        //create a new data object
        data = {
        'currentDatetime': (new Date).toUTCString(),
        'Heartrate': Math.round(normal(80, 10, 10)), //randomly generate a number
        };
        //get GPS sensor data
        var posOptions = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position){
            console.log(position);
            data.Gps_Lat = position.coords.latitude;
            data.Gps_Long = position.coords.longitude;
            data.Gps_Altitude = position.coords.altitude;
        }, function(err){
            console.log(err);
        })
        //set sensor data into $scope
        $scope.data = data;
    }, 5000 );

    $scope.trackSensorData = function(sensorData){
    }

    //utility function to get heartrate
    function normal(mu, sigma, nsamples){
        if(!nsamples) nsamples = 6
        if(!sigma) sigma = 1
        if(!mu) mu=0

        var run_total = 0
        for(var i=0 ; i<nsamples ; i++){
        run_total += Math.random()
        }

        return sigma*(run_total - nsamples/2)/(nsamples/2) + mu
    }

})

;