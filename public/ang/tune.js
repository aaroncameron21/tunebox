var app = angular.module('TuneApp',[])
  .run(function() {
    console.log('Angular loaded.');
  });
app.controller('TuneController', function($scope) {


    $scope.views = {};

    $scope.toggleView = function(view) {
      $scope.views[view] = !($scope.views[view] || false);
    }

    $scope.submitForm = function(remove) {
      if (tagsElement = document.getElementById('tags')) tagsElement.value = $scope.data.tags;
      if (deleteElement = document.getElementById('delete')) deleteElement.value = remove;
      document.getElementById('form').method = "post";
      document.getElementById('form').submit(); 
    };

    $scope.tagText = "";
    $scope.addTag = function() {
      var valid = true;

      if ($scope.data.tags.length >= 8) {
        valid = false;
      } else if ($scope.tagText.includes(',')) {
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

    $scope.redirect = function (url) {
      console.log("redirect:",url);
      window.location.href = url;
    }

    $scope.initialize = function(data) {
      console.log("DATA:",data);
      if (Array.isArray(data)) {
        $scope.data = data || [];
        $scope.data.forEach(function(val,index,array) {
          val.dateCreated  = new Date(val.dateCreated);
          val.dateModified = new Date(val.dateModified);
        });
      } else {
        $scope.data = data || {
          name: "",
          description: "",
          tags: ""
        };
        $scope.data.tags = $scope.data.tags.split(',');
        $scope.data.versions.forEach(function(val,index,array) {
          val.dateCreated  = new Date(val.dateCreated);
          val.dateModified = new Date(val.dateModified);
        });
      }
      console.log("DATA:",data);
    };


});