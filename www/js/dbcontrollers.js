var module = angular.module('starter.dbcontrollers', [])


// OBO controller
module.controller('OboCtrl', function($scope, $stateParams, $ionicSideMenuDelegate, $timeout, $ionicLoading, Queryer, ProcessGraph, DatasetStore, QuickLinks, Utilities, FavoriteService) {

  $scope.uri = $stateParams.uri;
  Utilities.grepDBfromURI($scope.uri);

  // Query the graph data from mobile.bio2rdf.org
  Queryer.setQuery(DatasetStore.current[0] ,'describe', 'json-ld', {"uri" : $scope.uri});
  Queryer.getJson().success(function(data){
    var idList = ProcessGraph.graph(data);
    var main = idList[$stateParams.uri]

    $scope.main = main;

    $scope.title = Utilities.capitalize(main["rdfs:label"])
    $scope.obodef = main["obolibrary:IAO_0000115"]

    $scope.obosuperclasses = []
    _.each(main["rdfs:subClassOf"], function(elem) {
      if (typeof elem == "string") {
      /*if (idList[elem].substring(0,1) != "_") {*/
          $scope.obosuperclasses.push(idList[elem])
        /*}*/
      } else {
        /*if {idList[elem["@id"]]}*/
        if (idList[elem["@id"]] != undefined) {
          $scope.obosuperclasses.push(idList[elem["@id"]]);
        }
      }
    });

    $scope.obosubclasses = []
    _.each(idList, function(elem) {
      if (elem["rdfs:subClassOf"] != undefined) {
        if (elem["rdfs:subClassOf"]["@id"] == $stateParams.uri ) {
          $scope.obosubclasses.push(idList[elem["@id"]])
        }
      }
    });

    $scope.xrefs = []
    if (main["oboInOwl:hasDbXref"] != undefined) {
      _.each(main["oboInOwl:hasDbXref"], function(elem) {
        $scope.xrefs.push(elem)
      });
    }

    // Fetch Image from Wiki -----
    ProcessGraph.getWikiImageUri($scope.uri).then(function(promise){
      console.log(promise);
      $scope.image = promise.data["http://xmlns.com/foaf/0.1/depiction"]["@id"];
    });

    if ($scope.image == undefined){
      ProcessGraph.getWikiImageLabel($scope.title.replace(" ","_")).then(function(promise){
        $scope.image = promise.data["http://xmlns.com/foaf/0.1/depiction"]["@id"];
      });
    }
    // -----------------------

    // Bookmark status and saving -----
    function bookmarkLookUpCall (tx, results) {
      var len = results.rows.length;
      if (len > 0){
        $scope.bookmarkStateImg = 'img/savedBookmark.png';
        $scope.bookmarkState = '1';
      }else {
        $scope.bookmarkStateImg = 'img/notsavedBookmark.png';
        $scope.bookmarkState = '0';
      }
    }

    $scope.lookupBookmarkState = function () {
      var id = DatasetStore.current[0]+"_"+$scope.uri;
      FavoriteService.queryDatabase('SELECT * FROM FAVORITES WHERE id = (?)', [id], bookmarkLookUpCall);
    } 

    $scope.toggleBookmarkState = function () {
      var id = DatasetStore.current[0]+"_"+$scope.uri;
      if ($scope.bookmarkState == '0'){
        FavoriteService.insertIntoDB({id:id, db:DatasetStore.current[0], uri:$scope.uri, label:$scope.title, time:Date.now()});
        $scope.bookmarkStateImg = 'img/savedBookmark.png';
        $scope.bookmarkState = '1';
      } else {
        FavoriteService.deleteFromDB(id);
        $scope.bookmarkStateImg = 'img/notsavedBookmark.png';
        $scope.bookmarkState = '0';
      }
    }

    $scope.lookupBookmarkState(); // set the state on init
    // -----------------------


    QuickLinks.addLink({uri:$scope.uri, label: $scope.title, db: DatasetStore.current[0]});

  });


  var reDragSideMenus = function (){
    $ionicSideMenuDelegate.canDragContent(true);
  }

  $scope.unSetDragging = function () {
    $ionicSideMenuDelegate.canDragContent(false);
    $timeout(reDragSideMenus,3000);
  }

});


//PUBMED
module.controller('PubmedCtrl', function($scope, $stateParams, Queryer, ProcessGraph) {

  $scope.uri = $stateParams.uri;
  var endpoint = $stateParams.endpoint;

  Queryer.setQuery('pubmed','describe','json-ld', {"uri" : $scope.uri});
  Queryer.getJson().success(function(data){
    var idList=ProcessGraph.graph(data);
    var main = idList[$stateParams.uri]
    _.each(main["pubmed_vocabulary:author"], function(elem) {
      $scope.pmauthors.push(idList[elem["@id"]]);
      });

    });
});


//DRUGBANK
module.controller('DrugBankCtrl', function($scope, $stateParams, $ionicSideMenuDelegate, $timeout, Queryer, ProcessGraph, DatasetStore, QuickLinks, Utilities) {

  $scope.uri = $stateParams.uri;

  // Query the graph data from mobile.bio2rdf.org
  Queryer.setQuery('drugbank' ,'describebeta', 'json-ld', {"uri" : $scope.uri});
  Queryer.getJson().success(function(data){
    var idList=ProcessGraph.graph(data);
    var main = idList[$stateParams.uri]

    /*$scope.title = Utilities.capitalize(main["rdfs:label"])*/
    /*$scope.dbdescription = main["dcterms:description"]["@value"];*/
    $scope.main=main;

    $scope.title = Utilities.capitalize(main["rdfs:label"]["@value"]);

    $scope.obosuperclasses = []
    _.each(main["rdfs:subClassOf"], function(elem) {
      if (typeof elem == "string") {
      /*if (idList[elem].substring(0,1) != "_") {*/
          $scope.obosuperclasses.push(idList[elem])
        /*}*/
      } else {
        /*if {idList[elem["@id"]]}*/
        if (idList[elem["@id"]] != undefined) {
          $scope.obosuperclasses.push(idList[elem["@id"]]);
        }
      }
    });

    $scope.obosubclasses = []
    _.each(idList, function(elem) {
      if (elem["rdfs:subClassOf"] != undefined) {
        if (elem["rdfs:subClassOf"]["@id"] == $stateParams.uri ) {
          $scope.obosubclasses.push(idList[elem["@id"]])
        }
      }
    });

    $scope.xrefs = []
    if (main["oboInOwl:hasDbXref"] != undefined) {
      _.each(main["oboInOwl:hasDbXref"], function(elem) {
        $scope.xrefs.push(elem)
      });
    }

    // Fetch Image from Wiki
    /*ProcessGraph.getWikiImageUri($scope.uri).then(function(promise){*/
    /*$scope.image = promise.data["http://xmlns.com/foaf/0.1/depiction"]["@id"];*/
    /*});*/

    /*if ($scope.image == undefined){*/
    /*ProcessGraph.getWikiImageLabel($scope.title).then(function(promise){*/
    /*$scope.image = promise.data["http://xmlns.com/foaf/0.1/depiction"]["@id"];*/
    /*});*/
    /*}*/

    QuickLinks.addLink({uri:$scope.uri, label: $scope.title, db: DatasetStore.current[0]});

  });


  var reDragSideMenus = function (){
    $ionicSideMenuDelegate.canDragContent(true);
  }

  $scope.unSetDragging = function () {
    $ionicSideMenuDelegate.canDragContent(false);
    $timeout(reDragSideMenus,3000);
  }
  
  $scope.mergeArray = function (elem) {
    if (elem instanceof Array) {
      return elem;
    } else {
     return [elem];
    }
  }

});

//Uniprot
module.controller('UniprotCtrl', function($scope, $stateParams, $ionicSideMenuDelegate, $timeout, Queryer, ProcessGraph, DatasetStore, QuickLinks, Utilities) {

  $scope.uri = $stateParams.uri;

  // Query the graph data from mobile.bio2rdf.org
  Queryer.setQuery('uniprot' ,'describe', 'json-ld', {"uri" : $scope.uri});
  Queryer.getJson().success(function(data){
    var idList=ProcessGraph.graph(data);
    var main = idList[$stateParams.uri]

    /*$scope.title = Utilities.capitalize(main["rdfs:label"])*/
    /*$scope.dbdescription = main["dcterms:description"]["@value"];*/
    $scope.main=main;

    $scope.obosuperclasses = []
    _.each(main["rdfs:subClassOf"], function(elem) {
      if (typeof elem == "string") {
      /*if (idList[elem].substring(0,1) != "_") {*/
          $scope.obosuperclasses.push(idList[elem])
        /*}*/
      } else {
        /*if {idList[elem["@id"]]}*/
        if (idList[elem["@id"]] != undefined) {
          $scope.obosuperclasses.push(idList[elem["@id"]]);
        }
      }
    });

    $scope.obosubclasses = []
    _.each(idList, function(elem) {
      if (elem["rdfs:subClassOf"] != undefined) {
        if (elem["rdfs:subClassOf"]["@id"] == $stateParams.uri ) {
          $scope.obosubclasses.push(idList[elem["@id"]])
        }
      }
    });

    $scope.xrefs = []
    if (main["oboInOwl:hasDbXref"] != undefined) {
      _.each(main["oboInOwl:hasDbXref"], function(elem) {
        $scope.xrefs.push(elem)
      });
    }

    // Fetch Image from Wiki
    /*ProcessGraph.getWikiImageUri($scope.uri).then(function(promise){*/
    /*$scope.image = promise.data["http://xmlns.com/foaf/0.1/depiction"]["@id"];*/
    /*});*/

    /*if ($scope.image == undefined){*/
    /*ProcessGraph.getWikiImageLabel($scope.title).then(function(promise){*/
    /*$scope.image = promise.data["http://xmlns.com/foaf/0.1/depiction"]["@id"];*/
    /*});*/
    /*}*/

    QuickLinks.addLink({uri:$scope.uri, label: $scope.title, db: DatasetStore.current[0]});

  });


  var reDragSideMenus = function (){
    $ionicSideMenuDelegate.canDragContent(true);
  }

  $scope.unSetDragging = function () {
    $ionicSideMenuDelegate.canDragContent(false);
    $timeout(reDragSideMenus,3000);
  }
  
  $scope.mergeArray = function (elem) {
    if (elem instanceof Array) {
      return elem;
    } else {
     return [elem];
    }
  }

});
