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
        $scope.submitButtonText = "Submit";
        $scope.loading = false;
        $scope.urlError = false;

        $scope.getResults = function() {
            $log.log("test");

            // get URL from input
            //fire API request

            var userInput = $scope.input_url;
            $http.post('/start', {"url": userInput}).
                success(function(results) {
                    $log.log("results " + results);
                    getWordCount(results); //.data is the actual id
                    $scope.wordcounts = null;
                    $scope.loading = true;
                    $scope.submitButtonText = "Loading..."
                }).
                error(function(error) {
                    $log.log(error);
                });

            //$http.post('/start',{"url":userInput})
            //    .success(function(response){
            //        $log.log(response);
            //        getWordCount(response.data); //.data is the actual id
            //        $scope.wordcounts = null;
            //        $scope.loading = true;
            //        $scope.submitButtonText = "Loading...";
            //    }).error(function(error){
            //        $log.error(error);
            //    });
            };
        function getWordCount(jobID) {

          var timeout = "";

          var poller = function() {
            // fire another request
            $http.get('/results/'+jobID).
              success(function(data, status, headers, config) {
                    //$log.log("ID "+ jobID);
                    //$log.log('status' + status);
                    //$log.log('data '+data);
                if(status === 202) {
                  $log.log(data, status);
                } else if (status === 200){
                    $log.log(data);
                    $scope.loading=false;
                    $scope.submitButtonText = "Submit";
                    $scope.wordcounts = data;
                    $scope.urlError = false;
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


        //function getWordCount(jobID) {
        //      var timeout = "";
        //
        //      var poller = function() {
        //        // fire another request
        //        $http.get('/results/'+jobID).
        //          success(function(response) {
        //            if(response.status === 202) {
        //                $log.log(response.data, response.status);
        //            } else if (response.status === 200){
        //                $log.log(response.data);
        //                $scope.loading=false;
        //                $scope.submitButtonText = "Submit";
        //                $scope.wordcounts = response.data;
        //                $scope.urlError = false;
        //                $timeout.cancel(timeout);
        //                return false;
        //            }
        //            // continue to call the poller() function every 2 seconds
        //            // until the timeout is cancelled
        //            timeout = $timeout(poller, 2000);
        //          }.error(function(error){
        //            $log.log(error);
        //            $scope.loading = false;
        //            $scope.submitButtonText="Submit";
        //            $scope.urlError = true;
        //        }));
        //      };
        //      poller();
        //    }

      }
    ]);
}());