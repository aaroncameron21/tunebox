var app = angular.module('AddExperimentApp',[])
  .run(function() {
    console.log('Angular loaded.');
  });
app.controller('AddExperimentController', function($scope) {


    $scope.data = {
      title: "",
      startDate: "",
      endDate: "",
      description: "",
      pi: "",
      manager: "",
      tags: []
    };

    function rand(i) {
      return Math.round((Math.random() * i))
    }
    $scope.data = {
      title: "Experiment" + rand(100000),
      startDate: (1+rand(4)) + "/" + rand(25) + "/" + 2016,
      endDate: (6 + rand(4)) + "/" + rand(25) + "/" + 2016,
      description: "DESC" + rand(1000),
      pi: "PI" + rand(1000),
      manager: "MANG" + rand(1000),
      tags: ["TAG"+rand(1000),"TAG"+rand(1000),"TAG"+rand(1000)]
    };

    document.getElementById("startDate").value = $scope.data.startDate;
    document.getElementById("endDate").value   = $scope.data.endDate;

    function parseDate(dateString) {
      var date = dateString.split('/');
      date = new Date(date[2],date[0]-1,date[1]);
      return date.getTime();
    };


    $scope.validateDates = function() {
      if ($scope.data.startDate > $scope.data.endDate) {
        return false;
      }
      return true;
    };

    $scope.tagText = "";
    $scope.addTag = function() {
      var valid = true;

      if ($scope.data.tags.length >= 8) {
        valid = false;
      } else {
        $scope.data.tags.forEach(function(tag) {
          if (tag === $scope.tagText) {
            valid = false;
          }
        });
      }

      if (valid) {
        $scope.data.tags.push($scope.tagText);
        $scope.tagText = "";
      }
    }
    $scope.deleteTag = function(deleteTag) {
      $scope.data.tags = $scope.data.tags.filter(function(tag) {
        return (tag != deleteTag)
      });
    }


    $scope.validate = function() {
      $scope.validationErrors = [];

      if (!$scope.validateDates())
        $scope.validationErrors.push("Dates are not valid.");

      return ($scope.validationErrors.length == 0);
    };

    $scope.submitForm = function(download) {
      $scope.data.startDate = parseDate(document.getElementById("startDate").value);
      $scope.data.endDate = parseDate(document.getElementById("endDate").value);
      if ($scope.validate()) {
        document.getElementById("data").value = JSON.stringify($scope.data);
        document.getElementById('subform').submit();
      }
      else {
        var alertString = "";
        $scope.validationErrors.forEach(function (err) {
          alertString += err + "\n";
        });
        alert("Validation failed:\n" + alertString);
      }
      
    };


});