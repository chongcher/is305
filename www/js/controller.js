angular.module('fitbyte.controllers', ['ionic','ngCordova'])

.controller('trackSensorDataController', function($scope, $state, $http, $q, $interval, $cordovaGeolocation, $cordovaDeviceMotion){

    var running;

    $scope.trackSensorData = function(sensorData){

        //Don't run multiple instances
        if ( angular.isDefined(running) ) return;

        var intervalInMilliseconds = angular.isDefined(sensorData.interval) ?  sensorData.interval * 1000 : 0;
        // intervalInMilliseconds = sensorData.interval * 1000;
        console.log("intervalInMilliseconds", intervalInMilliseconds);
        if(intervalInMilliseconds > 0){
            
            //triggers every (interval) seconds
            running = $interval(function(){
                
                //create a new data object
                data = {
                'currentDatetime': (new Date).toUTCString(),
                'Heartrate': Math.round(normal(80, 10, 10)), //randomly generate a number
                };
                
                //get GPS sensor data
                var posOptions = {timeout: 2500, enableHighAccuracy: true, maximumAge: 5000};
                $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position){
                    data.Gps_Lat = position.coords.latitude;
                    data.Gps_Long = position.coords.longitude;
                    data.Gps_Altitude = position.coords.altitude;
                }, function(err){
                    // An error occurred. Show a message to the user
                    console.log(err);
                })
                
                //get accelerometer sensor data
                $cordovaDeviceMotion.getCurrentAcceleration().then(function(result) {
                    console.log(result);
                    data.Accelerometer = result;
                    var X = result.x;
                    var Y = result.y;
                    var Z = result.z;
                    var timeStamp = result.timestamp;
                }, function(err) {
                    // An error occurred. Show a message to the user
                    console.log(err);
                });
                
                /*//get proximity sensor data
                navigator.proximity.getProximityState(function(state){
                    console.log(state);
                    data.Proximity_Sensor = state;
                }, function(err) {
                    // An error occurred. Show a message to the user
                    console.log(err);
                });*/
                
                //set sensor data into $scope
                $scope.data = data;
            }, intervalInMilliseconds );

        }
    }

    $scope.stopTracking = function(){
        if (angular.isDefined(running)) {
            $scope.data = {};
            $interval.cancel(running);
            running = undefined;
          }
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