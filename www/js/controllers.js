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
  .controller('LeftMenuCtrl', function($scope, $ionicActionSheet, DatasetsService) {

    $scope.databases = DatasetsService.all();

    $scope.onItemHold = function(item) {
      // alert("HOLD ON");

      // Show the action sheet
      $ionicActionSheet.show({

	// The various non-destructive button choices
	buttons: [
          { text: 'Share' },
          { text: 'Move' },
	],

	// The text of the red destructive button
	destructiveText: 'Delete',

	// The title text at the top
	titleText: 'Modify your album',

	// The text of the cancel button
	cancelText: 'Cancel',

	// Called when the sheet is cancelled, either from triggering the
	// cancel button, or tapping the backdrop, or using escape on the keyboard
	cancel: function() {
	},

	// Called when one of the non-destructive buttons is clicked, with
	// the index of the button that was clicked. Return
	// "true" to tell the action sheet to close. Return false to not close.
	buttonClicked: function(index) {
          return true;
	},

	// Called when the destructive button is clicked. Return true to close the
	// action sheet. False to keep it open
	destructiveButtonClicked: function() {
          return true;
	}
      });
      
    }

    $scope.onItemDelete = function(item) {
      $scope.items.splice($scope.items.indexOf(item), 1);
    };

  })

  .directive('myOnHold', function($ionicGesture) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attr) {
	$ionicGesture.on('hold', function(e) {
          $scope.$eval($attr.myOnHold);
	}, $element);
      }
    }
  })

;


