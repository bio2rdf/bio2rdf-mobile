angular.module('starter.controllers', [])


// A simple controller that fetches a list of data from a service
// TODO : Group together Queryer services
  .controller('SearchCtrl', function($scope, $http, RestUrlBuilderService, GetJsonService, queryConfig, replacePrefixesService) {

    // "Pets" is a service returning mock data (services.js)
    // $scope.pets = PetService.all();

    $scope.querySearch = function () {

      // $scope.pets = PetService.all();

      console.log(angular.lowercase(this.queryTerm));

      queryConfig.parameters.parm1 = this.queryTerm;

      var url = RestUrlBuilderService.restURL(queryConfig);

      GetJsonService.getJson(url).success(function(data) {

	// Switch the prefix in @id with the complete url from @context 
	replacePrefixesService.replacePrefix(data["@context"], data["@graph"]);
	$scope.searchResultGraph = data["@graph"];

      })

    };

  })

  .controller('DescribeCtrl', function($scope, $stateParams) {

    $scope.uri = $stateParams.uri;

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

  })


// LeftMenuCtrl:
// 	Need :
// 		Fetch All databases from dbdev and list them
// 		Filter the databases based on the search box
  .controller('LeftMenuCtrl', function($scope,DatasetsService) {
    $scope.databases = DatasetsService.all();
  });

