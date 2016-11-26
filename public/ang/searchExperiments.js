var app = angular.module('SearchExperimentsApp',['ui.bootstrap'])
  .run(function() {
    console.log('Angular loaded.');
  });
app.controller('SearchExperimentsController', function($scope,$location) {

    $scope.initialize = function(data) {

      $scope.search = {};
      $scope.search.searchText = "";
      $scope.search.currentlyActive = "false";
      $scope.search.samplesAvailable = "false";

      var statements = window.location.href.slice(window.location.href.indexOf("?")+1).split('&');
      statements.forEach(function(statement) {
        var split = statement.split('=');
        if (split[1]) {
          $scope.search[split[0]] = split[1].split('+').join(' ');
        }
      });

      $scope.search.currentlyActive  = $scope.search.currentlyActive  === "true" ? true : false;
      $scope.search.samplesAvailable = $scope.search.samplesAvailable === "true" ? true : false;

      $scope.searchPerformed = false;
      if (data.data) {
        $scope.searchPerformed = true;

        data.data.forEach(function(d) {
            d.startDate = new Date(d.startDate).toLocaleDateString();
            d.endDate = new Date(d.endDate).toLocaleDateString();
        });
        $scope.data = data.data;
      }

      $("#loading").hide();
      $("#searchWell").show();

    };


    function stringifyDate(date) {
      var d = Date.parse(date);
      d = (d.getMonth()+1) + "/" + d.getDay() + "/" + d.getFullYear();
      return d;
    }

    function parseDate(dateString) {
      var date = dateString.split('/');
      date = new Date(date[2],date[0]-1,date[1]);
      return date;
    };

    // $scope.validateDates = function() {
    //   var dateA = parseDate($scope.data.startDate);
    //   var dateB = parseDate($scope.data.endDate);
    //   if (dateA.getTime() > dateB.getTime()) {
    //     return false;
    //   }
    //   return true;
    // };


    $scope.toggle = function(name) {
      $scope.search[name] = !$scope.search[name];
    }


    $scope.validate = function() {
      $scope.validationErrors = [];
      return ($scope.validationErrors.length == 0);
    };

    $scope.submitForm = function(download) {
      $("#loading").show();
      $("#searchWell").hide();
      if ($scope.validate()) {
        document.getElementById('currentlyActive').value = $scope.search.currentlyActive;
        document.getElementById('samplesAvailable').value = $scope.search.samplesAvailable;
        document.getElementById('searchOn').value = 'true';
        document.getElementById('subform').submit();
      }
      else {
        var alertString = "";
        $scope.validationErrors.forEach(function (err) {
          alertString += err + "\n";
        });
        alert("Validation failed:\n" + alertString);
        $("#loading").hide();
        $("#searchWell").show();
      }
      
    };


});