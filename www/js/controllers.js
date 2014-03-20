angular.module('starter.controllers', [])


// A simple controller that fetches a list of data from a service
  .controller('SearchCtrl', function($scope, $http, PetService, RestUrlBuilderService, GetJsonService) {

    // "Pets" is a service returning mock data (services.js)
    // $scope.pets = PetService.all();

    // TODO : create services .value for namespace variable
    var urlConfig = { "namespace" : "ontobee",
                      "method" : "search_ns",
                      "format" : "json-ld",
                      "parameters" : {
			"parm2" : "DOID",
			"parm1" : "asthma"
                      }
                    };

    console.log(urlConfig);

    $scope.querySearch = function () {

      // $scope.pets = PetService.all();

      console.log(angular.lowercase(this.queryTerm));

      urlConfig.parameters.parm1 = this.queryTerm;
      var url = RestUrlBuilderService.buildURL(urlConfig);


      GetJsonService.getJson(url).success(function(data) {

	// TODO : switch the prefix in @id with the comple url from @context 
	// $scope.context = 
	$scope.searchResultGraph = data["@graph"];
	console.log(data);

      })


    };



  })


// A simple controller that shows a tapped item's data
  .controller('PetDetailCtrl', function($scope, $stateParams, PetService) {
    // "Pets" is a service returning mock data (services.js)
    $scope.pet = PetService.get($stateParams.petId);
  })


// Event controller to toggle side panels with buttons
  .controller('HeaderCtrl', function($scope) {

    $scope.toggleLeftPanel = function() {
      $scope.sideMenuController.toggleLeft();
    };

    $scope.toggleRightPanel = function() {
      $scope.sideMenuController.toggleRight();
    };

  });


