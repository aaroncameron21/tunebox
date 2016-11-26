var app = angular.module('ViewExperimentApp',[])
  .run(function() {
    console.log('Angular loaded.');
  });
app.controller('ViewExperimentController', function($scope) {

    $scope.initialize = function(data) {
      var dateA = new Date(data.data.startDate);
      var dateB = new Date(data.data.endDate);
      data.data.startDate = {date: dateA.toLocaleDateString(), time: dateA.toLocaleTimeString().replace(/:.. /i,' ')};
      data.data.endDate   = {date: dateB.toLocaleDateString(), time: dateB.toLocaleTimeString().replace(/:.. /i,' ')};
      $scope.data = data.data;
    };

});