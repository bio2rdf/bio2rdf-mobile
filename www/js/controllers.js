var module = angular.module('starter.controllers', [])


// A simple controller that fetches a list of data from a service
// TODO : Group together Queryer services
  module.controller('SearchCtrl', function($scope, Queryer, replacePrefixesService) {

    // "Pets" is a service returning mock data (services.js)
    // $scope.pets = PetService.all();

    $scope.querySearch = function () {

      // $scope.pets = PetService.all();
      // console.log(angular.lowercase(this.queryTerm));

      Queryer.setQuery('ontobee','search_ns', 'json-ld', {"parm1" : this.queryTerm, "parm2" : "DOID"});

      Queryer.getJson().success(function(data) {
	// Switch the prefix in @id with the complete url from @context 
	replacePrefixesService.replacePrefix(data["@context"], data["@graph"]);
	$scope.searchResultGraph = data["@graph"];
      })

    };

  })

  module.controller('DescribeCtrl', function($scope, $stateParams) {

    $scope.uri = $stateParams.uri;

  })


// Event controller to toggle side panels with buttons
  module.controller('HeaderCtrl', function($scope) {

    $scope.toggleLeftPanel = function() {
      $scope.sideMenuController.toggleLeft();
    };

    $scope.toggleRightPanel = function() {
      $scope.sideMenuController.toggleRight();
    };

  })


// LeftMenuCtrl:
// 	Need :
// 		Fetch All databases from dbdev and list them
  module.controller('LeftMenuCtrl', function($scope, $ionicActionSheet, DatasetService, replacePrefixesService) {

    // $scope.databases = DatasetService.all();
    $scope.databases = [];

    DatasetService.listDB().getJson().success(function(data) {

      replacePrefixesService.replacePrefix(data["@context"], data["@graph"]);

      for (var i in data["@graph"]){
	if(data["@graph"][i]["dc:title"] != "namespace:endpoints_mother"){
	  $scope.databases.push(data["@graph"][i]);
	}else{
	  $scope.header = data["@graph"][i];
	}
      }

    });


    // Put it somewhere else ?
    $scope.onItemHold = function(item) {
      alert("HOLD ON");
    };


    $scope.changeCurrentDatabase = function(db) {
      console.log(db);
    };

  })


  module.directive('myOnHold', function($ionicGesture) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attr) {
	$ionicGesture.on('hold', function(e) {
          $scope.$eval($attr.myOnHold);
	}, $element);
      }
    }
  })



// A simple controller that shows a tapped item's data
  .controller('PetDetailCtrl', function($scope, $stateParams, PetService) {
    // "Pets" is a service returning mock data (services.js)
    $scope.pet = PetService.get($stateParams.petId);
  })

;


