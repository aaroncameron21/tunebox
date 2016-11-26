var app = angular.module('VersionApp',[])
  .run(function() {
    console.log('Angular loaded.');
  });
app.controller('VersionController', function($scope) {


    $scope.views = {};

    $scope.toggleView = function(view) {
      $scope.views[view] = !($scope.views[view] || false);
    }

    $scope.redirect = function (url) {
      console.log("redirect:",url);
      window.location.href = url;
    }

    $scope.submitForm = function(remove) {
      if (deleteElement = document.getElementById('delete')) deleteElement.value = remove;
      if (tuneElement = document.getElementById('tune')) tuneElement.value = $scope.data.tune._id;
      document.getElementById('form').method = "post";
      document.getElementById('form').submit(); 
    };

    $scope.updateSelectedFile = function() {
      try {
        $scope.selectedFile = document.getElementById('file').files[0].name;
      } catch(err) {$scope.selectedFile="";}
      console.log("SF:",$scope.selectedFile);
      $scope.$apply();
    }
    $scope.selectedFile = "";

    $scope.path = 'http://localhost:8080/583084769b8430135219e50a/583754c72d266834eedaa9b4.wav';

    $scope.initialize = function(data) {
      console.log("DATA IN:",data);
      $scope.data = {
        id: data._id || "",
        description: data.description || "",
        tempo: data.tempo || 128,
        key: data.key || "C",
        tune: data.tune,
        file: data.file
      };
      console.log("DATA OUT:",$scope.data);
    };

    setInterval($scope.updateSelectedFile,500);


});