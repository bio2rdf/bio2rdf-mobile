var module = angular.module('starter.dbcontrollers', [])


// OBO
module.controller('OboCtrl', function($scope, $stateParams, Queryer, ProcessGraph, DatasetStore, QuickLinks) {
  
  $scope.uri = $stateParams.uri;

  Queryer.setQuery(DatasetStore.current[0] ,'describe', 'json-ld', {"uri" : $scope.uri});
  Queryer.getJson().success(function(data){
    var idList=ProcessGraph.graph(data);
    var main = idList[$stateParams.uri]

    console.log(main);

    $scope.title = main["rdfs:label"]
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

    QuickLinks.addLink({uri:$scope.uri, label: $scope.title, db: DatasetStore.current[0]});
  });

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
