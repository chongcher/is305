angular.module('fitbyte.controllers', ['ionic','ngCordova'])

.controller('trackSensorDataController', function($scope, $state, $http, $q, $interval, $cordovaGeolocation){

    var running;

    //set the default value of sensorData.interval, must set Device_ID too or it disappears
    $scope.sensorData = {interval: 5, Device_ID: "d001"};

    $scope.trackSensorData = function(sensorData){

        //Don't run multiple instances of interval
        if ( angular.isDefined(running) ) {
            console.log("Already tracking!");
        };

        var intervalInMilliseconds = angular.isDefined(sensorData.interval) ?  sensorData.interval * 1000 : 0;
        if(intervalInMilliseconds > 0){
            
            //triggers every (interval) seconds
            running = $interval(function(){
                getSensorData(sensorData).then(function(data){
                    
                    writeToDB(data);
                
                })
            }, intervalInMilliseconds);
        }
                
    }

    getSensorData = function(sensorData){

        var deferred = $q.defer();
        var promise;
        //create a new data object
        var data = {
        'Device_ID': sensorData.Device_ID,
        'Record_Datetime': (new Date).toUTCString(),
        'Heartrate': Math.round(normal(80, 10, 10)), //randomly generate a number
        };
                
        //get Gps sensor data
        getGPSData().then(function(gpsData){
            for(var pair in gpsData){
                data[pair] = gpsData[pair];
            }
            
            //get proximity sensor data
            data.Proximity_Sensor = Math.round(normal(125, 255, 1)); //randomly generate a number;
            data.Proximity_Sensor = 1.7242345;
            
            //set sensor data into $scope
            $scope.data = data;

            promise = deferred.resolve(data);

        })
                
        return deferred.promise;

    }

    getGPSData = function(){

        var deferred = $q.defer();
        var promise;
        var posOptions = {timeout: 2500, enableHighAccuracy: true, maximumAge: 5000};
        
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position){
            var gpsData = {};
            gpsData.Gps_Lat = position.coords.latitude;
            gpsData.Gps_Long = position.coords.longitude;
            gpsData.Gps_Accuracy = position.coords.accuracy;
            console.log("Gps.altitude: ", position.coords.altitude);

            promise = deferred.resolve(gpsData);

        }, function(err){
            // An error occurred. Show a message to the user
            console.log(err);
            promise = deferred.error("Error getting GPS data");
        })

        return deferred.promise;

    }

    writeToDB = function(data){
        //write data to db
        function dbAPI(){
            var url = 'https://u7dnjewi12.execute-api.ap-southeast-1.amazonaws.com/dev/';
            var deferred = $q.defer();
            var httpRequest = {
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data,
            };
            var promise = $http(httpRequest).success(function (response) {
                deferred.resolve(response);
            }).error(function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }
        
        dbAPI().then(function(response){
            console.log(response);
        })
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