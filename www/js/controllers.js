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
	ReplacePrefixesService.replacePrefix(data["@context"], data["@graph"]);
	$scope.searchResultGraph = data["@graph"];
      })
  };

});

module.controller('DescribeCtrl', function($scope, $stateParams, Queryer, ProcessGraph) {
  $scope.uri = $stateParams.uri;
  // Temporairement json hardcoder
  Queryer.setQuery('doid','describe2', 'json-ld', {"uri" : $scope.uri});
  Queryer.getJson().success(function(data){
    console.log(data);
    var idList=ProcessGraph.graph(data);
    var main = idList[$stateParams.uri]
    $scope.title = main["rdfs:label"]
    $scope.abstract = idList[main["dcterms:abstract"]["@id"]]["pubmed_vocabulary:abstract_text"]
    
    $scope.authors = []
    _.each(main["pubmed_vocabulary:author"], function(elem) {
      $scope.authors.push(idList[elem["@id"]]);
    });
      


  });
});


// Event controller to toggle side panels with buttons
module.controller('HeaderCtrl', function($scope) {

  $scope.toggleLeftPanel = function() {
    $scope.sideMenuController.toggleLeft();
  };
tasetStore.push({
    title: data["@graph"][i]["dc:title"], 
    tripleCount: data["@graph"][i]["bm:bio2rdf_vocabulary:triple_count"],
    foafDepiction: data["@graph"][i]['http://xmlns.com/foaf/0.1/depiction']['@id']
  });

  $scope.toggleRightPanel = function() {
    $scope.sideMenuController.toggleRight();
  };

});


// LeftMenuCtrl:
// 	Need :
// 		Fetch All databases from dbdev and list them
module.controller('LeftMenuCtrl', function($scope, $ionicActionSheet, DatasetService, ReplacePrefixesService, DatasetStore) {

  // $scope.databases = DatasetService.all();
  $scope.databases = [];

  DatasetService.listDB().getJson().success(function(data) {

    ReplacePrefixesService.replacePrefix(data["@context"], data["@graph"]);
    
    for (var i in data["@graph"]){
      if(data["@graph"][i]["dc:title"] != "namespace:endpoints_mother"){

        $scope.databases.push({
          title: data["@graph"][i]["dc:title"], 
          tripleCount: data["@graph"][i]["bm:bio2rdf_vocabulary:triple_count"],
          foafDepiction: data["@graph"][i]['http://xmlns.com/foaf/0.1/depiction']['@id']
        });
        DatasetStore.push({
          title: data["@graph"][i]["dc:title"], 
          tripleCount: data["@graph"][i]["bm:bio2rdf_vocabulary:triple_count"],
          foafDepiction: data["@graph"][i]['http://xmlns.com/foaf/0.1/depiction']['@id']
        });
      } else {
        $scope.header = data["@graph"][i];
      }
    }
    
    console.log(DatasetStore);
  });

  // Put it somewhere else ?
  $scope.onItemHold = function(item) {
    alert("HOLD ON");
  };

  $scope.changeCurrentDatabase = function(db) {
    console.log(db);
  };

});


module.directive('myOnHold', function($ionicGesture) {
  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      $ionicGesture.on('hold', function(e) {
        $scope.$eval($attr.myOnHold);
      }, $element);
    }
  }
});



// A simple controller that shows a tapped item's data
module.controller('PetDetailCtrl', function($scope, $stateParams, PetService) {
  // "Pets" is a service returning mock data (services.js)
  $scope.pet = PetService.get($stateParams.petId);
});


