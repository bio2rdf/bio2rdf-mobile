var module = angular.module('starter.controllers', [])

// A simple controller that fetches a list of data from a service
// TODO : Group together Queryer services
module.controller('SearchCtrl', function($scope, Queryer, ReplacePrefixesService, DatasetStore, SearchService) {

  $scope.initPage = function () {
    return DatasetStore.current[0] == "init";
  }

  $scope.$on('$locationChangeSuccess', function(event) {
    $scope.searchResultGraph = [];
    $scope.moreItemsAvailable = false;
  });

  $scope.querySearch = function (isNew) {

    $scope.currentDB = DatasetStore.current[0];

    if(isNew == 1){
      $scope.offset = 0;
    }

    Queryer.setQuery(DatasetStore.current[0],SearchService.queryMode(this.queryTerm), 'json-ld', {"parm1" : this.queryTerm, "parm2" : $scope.offset});

    Queryer.getJson().success(function(data) {
      // Switch the prefix in @id with the complete url from @context
      ReplacePrefixesService.replacePrefix(data["@context"], data["@graph"]);

      if(isNew != 1){
        $scope.searchResultGraph = $scope.searchResultGraph.concat(SearchService.getGraphQuery(data["@graph"]));
      }else{
        $scope.searchResultGraph = SearchService.getGraphQuery(data["@graph"]);
      }

      // Look if there are more items available
      if(data["@graph"] == undefined){
        $scope.moreItemsAvailable = false;
      } else if(data["@graph"].length >= 20){
        $scope.moreItemsAvailable = true;
        $scope.offset = $scope.offset + 20;
      }else{
        $scope.moreItemsAvailable = false;
      }

      $scope.$broadcast('scroll.infiniteScrollComplete');

    })
  };

  $scope.clearSearch = function () {
    $scope.queryTerm = '';
  };

  $scope.searchResultGraph = [];
  $scope.moreItemsAvailable = false;
  $scope.offset = 0;

});

module.controller('DescribeCtrl', function($scope, $stateParams, Queryer, ProcessGraph) {
  console.log($stateParams);
});


// Event controller to toggle side panels with buttons
module.controller('MainCtrl', function($scope, $location, DatasetStore) {

  $scope.$on('$locationChangeSuccess', function(event) {
    if($location.url() != '/tab/favorite'){
      $scope.setHeaderImg(DatasetStore.all[DatasetStore.current].foafDepiction);
    }else {
      $scope.setHeaderImg("img/bookmark.png");
    }
  });

  $scope.toggleLeftPanel = function() {
    $scope.sideMenuController.toggleLeft();
  };
  $scope.toggleRightPanel = function() {
    $scope.sideMenuController.toggleRight();
  };

  $scope.setHeaderImg = function (img) {
    $scope.headerImg = img;
  };

  $scope.setHeaderImg(DatasetStore.all[DatasetStore.current].foafDepiction);    

});


// LeftMenuCtrl:
module.controller('LeftMenuCtrl', function($scope, $location, $ionicLoading, DatasetStore, DatasetService, ReplacePrefixesService){

  $scope.databases = [];

  DatasetService.listDB().getJson().success(function(data) {

    ReplacePrefixesService.replacePrefix(data["@context"], data["@graph"]);

    for (var i in data["@graph"]){

      if(data["@graph"][i]["dc:title"] != "namespace:endpoints_mother"){

        var id = data["@graph"][i]["@id"].split(/:/).pop();

        $scope.databases.push({
          id: id,
          title: data["@graph"][i]["dc:title"],
          tripleCount: data["@graph"][i]["bm:bio2rdf_vocabulary:triple_count"],
          foafDepiction: data["@graph"][i]['http://xmlns.com/foaf/0.1/depiction']['@id']
        });

        DatasetStore.all[id] = {
          title: data["@graph"][i]["dc:title"],
          tripleCount: data["@graph"][i]["bm:bio2rdf_vocabulary:triple_count"],
          foafDepiction: data["@graph"][i]['http://xmlns.com/foaf/0.1/depiction']['@id'],
          endpoint: data["@graph"][i]['bm:bio2rdf_vocabulary:endpoint']['@id'],
          url_identifier: data["@graph"][i]['bm:bio2rdf_vocabulary:url_identifier']
        };

      } else {
        $scope.header = data["@graph"][i];
      }
    }

  });

  // Put it somewhere else ?
  $scope.onItemHold = function(item) {
    alert("HOLD ON");
  };

  $scope.changeCurrentDatabase = function(dbId) {
    DatasetStore.current = [dbId];
    $scope.setHeaderImg(DatasetStore.all[DatasetStore.current].foafDepiction);
    $location.path("/#/tab/search");
    $scope.sideMenuController.toggleLeft();
  };

});



module.controller('RightMenuCtrl', function($scope, $location, $ionicLoading, DatasetStore, QuickLinks){

  $scope.links = QuickLinks.getLinks();

  $scope.getImg = function (db){
    return DatasetStore.all[db].foafDepiction;
  }

  $scope.goToDescribe = function (l) {
    var url = "/#/tab/describe-" + l.db + "?uri=" + l.uri;
    // console.log($location.path());
    $location.path("/#/tab/describe-doid?uri=http://purl.obolibrary.org/obo/DOID_2841");
    // console.log($location.path());
  }

});


module.controller('FavoriteCtrl', function($scope, $location, DatasetStore, DatasetService, ReplacePrefixesService){

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
