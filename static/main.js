/**
 * Created by toruitas on 15-8-31.
 */
//(function () {
//
//    'use strict';
//
//    var app = angular.module('WordcountApp', []);
//
//    app.controller('WordcountController', ['$scope','$log','$http', function($scope,$log,$http) {
//            $scope.getResults = function() {
//                $log.log("test");
//
//                // get URL from input
//                var userInput = $scope.input_url;
//                //fire API request
//                $log.log(userInput);
//                //$http.post('/start',{"url":userInput})
//                //    .success(function(results){
//                //        $log.log(results);
//                //    })
//                //    .error(function(error){
//                //        $log.log(error);
//                //    })
//            };
//      }
//
//    ]);
//}());

//This uses dependency injection: https://docs.angularjs.org/guide/di to inject $scope object and $log service
//

(function () {
// Works the exact same as above but using aliasing for clarity
    'use strict';

    var app = angular.module('WordcountApp', []);

    app.controller('WordcountController', ['$scope','$log','$http','$timeout', function($scope, $log,$http,$timeout) {
        this.getResults = function() {
            $log.log("test");

            // get URL from input
            //fire API request

            var userInput = this.input_url;
            $http.post('/start',{"url":userInput})
                .then(function(response){
                    $log.log(response);
                    getWordCount(response.data); //.data is the actual id
                },
                function(error){
                    $log.error(error);
                });
            };

        this.testStuff = function(){
            var jobID1="929acea8-c631-498c-9e1d-d88ac6889402";
            getWordCount(jobID1)
        };

        //this.orClick = function(){
        //    $log.log("test")
        //};

        function getWordCount(jobID) {
              var timeout = "";

              var poller = function() {
                // fire another request
                $http.get('/results/'+jobID).
                  then(function(response) {
                    if(response.status === 202) {
                        $log.log(response.data, response.status);
                    } else if (response.status === 200){
                        $log.log(response.data);
                        $scope.wordcounts = response.data;
                        $timeout.cancel(timeout);
                        return false;
                    }
                    // continue to call the poller() function every 2 seconds
                    // until the timeout is cancelled
                    timeout = $timeout(poller, 2000);
                  });
              };
              poller();
            }

      }
    ]);
}());