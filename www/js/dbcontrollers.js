var module = angular.module('starter.dbcontrollers', [])


// OBO
module.controller('OboCtrl', function($scope, $stateParams, Queryer, ProcessGraph, DatasetStore, QuickLinks, Utilities) {
  
  function getWikiImage () {

    // Add wiki image either with X link on the id or generic name
    var code = $scope.uri.split("_");

    Queryer.setQuery(DatasetStore.current[0],'wiki_image', 'json-ld', {"parm1" : code[code.length-1] });

    Queryer.getJson().success(function(wikiData){ 
      if (wikiData["http://xmlns.com/foaf/0.1/depiction"] != undefined){
        $scope.image = wikiData["http://xmlns.com/foaf/0.1/depiction"]["@id"];
      }
    });

    // Try a generic query to wiki based on the label
    // <http://dbpedia.org/resource/{{label}}> foaf:depiction $image
    if($scope.image === undefined){
      var uri = "http://dbpedia.org/resource/" + Utilities.capitalize($scope.title);
      Queryer.setQuery('wiki','image', 'json-ld', {"uri" : uri });
      Queryer.getJson().success(function(wikiData2){ 
        if (wikiData2["http://xmlns.com/foaf/0.1/depiction"] != undefined){
          $scope.image = wikiData2["http://xmlns.com/foaf/0.1/depiction"]["@id"];
        }
      });

    }

  }

  $scope.uri = $stateParams.uri;

  // Query the graph data from mobile.bio2rdf.org
  Queryer.setQuery(DatasetStore.current[0] ,'describe', 'json-ld', {"uri" : $scope.uri});
  Queryer.getJson().success(function(data){
    var idList=ProcessGraph.graph(data);
    var main = idList[$stateParams.uri]

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

    QuickLinks.addLink({uri:$scope.uri, label: $scope.title, db: DatasetStore.current[0]});

    getWikiImage();

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
