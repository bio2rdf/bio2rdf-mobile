var module = angular.module('starter.controllers', ['ionic'])


// A simple controller that fetches a list of data from a service
// TODO : Group together Queryer services
module.controller('SearchCtrl', function($scope, Queryer, ReplacePrefixesService, DatasetStore, SearchService) {

  $scope.initPage = function () {
    if (DatasetStore.current[0] == "favorite") {
      DatasetStore.current[0] = "init";
    }
    return DatasetStore.current[0] == "init";
  }

  $scope.searchType = function () {
    return DatasetStore.all[DatasetStore.current[0]].search_type != 'typeahead';
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

    if (this.queryTerm.length == 0){
      return;
    }

    Queryer.setQuery(DatasetStore.current[0],SearchService.queryMode(this.queryTerm), 'json-ld', {"parm1" : this.queryTerm.replace(/\s+/g,'\"+and+\"'), "parm2" : $scope.offset});

    Queryer.getJson().success(function(data) {

      ReplacePrefixesService.replacePrefix(data);

      if(isNew != 1){
        $scope.searchResultGraph = $scope.searchResultGraph.concat(SearchService.getGraphQuery(data));
      }else{
        $scope.searchResultGraph = SearchService.getGraphQuery(data);
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
  // console.log($stateParams);
});


// Event controller to toggle side panels with buttons
module.controller('MainCtrl', function($scope, $location, $ionicSideMenuDelegate, $stateParams, $ionicGesture, DatasetStore) {

  ionic.Platform.ready(function() {
    
    StatusBar.hide();
    // ionic.Platform.fullScreen();

  });

  $scope.headerImg = function () {
    if(DatasetStore.all[DatasetStore.current[0]] != undefined) {
      return DatasetStore.all[DatasetStore.current[0]].foafDepiction;
    } else {
      return "img/bio2rdf.png";
    }
  }

  $scope.toggleLeftPanel = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.toggleRightPanel = function() {
    $ionicSideMenuDelegate.toggleRight();
  };


  $scope.iconStyle = function () {
    if($ionicSideMenuDelegate.isOpenRight()) {
      return 'ion-arrow-graph-down-right';
    } else {
      return 'ion-arrow-graph-down-left';
    }
  }

  $scope.$on('$locationChangeSuccess', function(event) {
    if($location.path().indexOf("describe-") > -1){
      DatasetStore.current = [$location.path().split("-")[1]];
    }
  });

});


// LeftMenuCtrl:
module.controller('LeftMenuCtrl', function($scope, $location, $ionicLoading, DatasetStore, DatasetService, ReplacePrefixesService){

  $scope.databases = [];

  DatasetService.listDB().getJson().success(function(data) {

    ReplacePrefixesService.replacePrefix(data["@context"], data);

    for (var i in data["@graph"]){

      if(data["@graph"][i]["dc:title"] != "namespace:endpoints_mother"){
        
        var id = data["@graph"][i]["@id"].split(/:/).pop();

        if (data["@graph"][i]['http://xmlns.com/foaf/0.1/depiction'] != undefined){

          $scope.databases.push({
            id: id,
            title: data["@graph"][i]["dc:title"],
            tripleCount: data["@graph"][i]["bm:bio2rdf_vocabulary:triple_count"],
            foafDepiction: data["@graph"][i]['http://xmlns.com/foaf/0.1/depiction']['@id'],
            endpoint: data["@graph"][i]['bm:bio2rdf_vocabulary:endpoint']['@id']
          });

          DatasetStore.all[id] = {
            title: data["@graph"][i]["dc:title"],
            tripleCount: data["@graph"][i]["bm:bio2rdf_vocabulary:triple_count"],
            foafDepiction: data["@graph"][i]['http://xmlns.com/foaf/0.1/depiction']['@id'],
            endpoint: data["@graph"][i]['bm:bio2rdf_vocabulary:endpoint']['@id'],
            url_identifier: data["@graph"][i]['bm:bio2rdf_vocabulary:url_identifier'],
            search_type: data["@graph"][i]['bm:bio2rdf_vocabulary:search_type']
          };

        }

      } else {
        $scope.header = data["@graph"][i];
      }
    }

  });

  // Put it somewhere else ?
  $scope.onItemHold = function(item) {
    // alert("HOLD ON");
  };

  $scope.changeCurrentDatabase = function(dbId) {
    DatasetStore.current = [dbId];
    $location.path("#/tab/search");
    $scope.toggleLeftPanel();
  };

});


module.controller('RightMenuCtrl', function($scope, $location, $ionicLoading, $window, DatasetStore, QuickLinks){

  $scope.links = QuickLinks.getLinks();

  $scope.getImg = function (db){
    return DatasetStore.all[db].foafDepiction;
  }

  $scope.goToDescribe = function (l) {
    var url = "#/tab/describe-" + l.db + "?uri=" + l.uri;
    $window.location.href = url;
    DatasetStore.current = [l.db];
  }

  

});


module.controller('FavoriteCtrl', function($scope, $location, DatasetStore, DatasetService, FavoriteService){

  $scope.convertTime = function (timestamp) {
    var date = new Date(timestamp);
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  }

  DatasetStore.current = ["favorite"];

  $scope.datasets = DatasetStore.all;

  function querySuccess(tx, results) {
    $scope.result = {};
    var len = results.rows.length;
    var res = [];

    for (var i=0; i<len; i++){
      // $scope.result.push(results.rows.item(i).label);
      if ($scope.result[results.rows.item(i).db] == undefined){
        $scope.result[results.rows.item(i).db] = [
          {
            id: results.rows.item(i).id,
            uri: results.rows.item(i).uri,
            // db: results.rows.item(i).db,
            label: results.rows.item(i).label,
            timestamp: results.rows.item(i).timestamp
          }
        ];

      } else {
        $scope.result[results.rows.item(i).db].push({
          id: results.rows.item(i).id,
          uri: results.rows.item(i).uri,
          // db: results.rows.item(i).db,
          label: results.rows.item(i).label,
          timestamp: results.rows.item(i).timestamp
        });
      }
    }
    $scope.$apply();
  }

  FavoriteService.queryDatabase('SELECT * FROM FAVORITES ORDER BY timestamp DESC', [], querySuccess);

  $scope.deleteBookmark = function (id){
    FavoriteService.deleteFromDB(id);
  }

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

