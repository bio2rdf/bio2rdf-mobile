var module = angular.module('starter.dbcontrollers', [])

// OBO controller
module.controller('OboCtrl', function($scope, $stateParams, $ionicSideMenuDelegate, $timeout, $ionicLoading, Queryer, ProcessGraph, DatasetStore, QuickLinks, Utilities, FavoriteService) {

  $scope.uri = $stateParams.uri;

  // Set ng-show
  $scope.showData = 0;
  $scope.loading = 1;

  // Query the graph data from mobile.bio2rdf.org
  Queryer.setQuery(DatasetStore.current[0] ,'describe', 'json-ld', {"uri" : $scope.uri});
  $scope.loading = 1;
  Queryer.getJson().success(function(data){
    var idList = ProcessGraph.graph(data);
    var main = idList[$stateParams.uri]

    $scope.main = main;

    $scope.title = Utilities.capitalize(main["rdfs:label"])
    $scope.obodef = main["obolibrary:IAO_0000115"]

    $scope.currentDB = DatasetStore.current[0];

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
      $scope.image = promise.data["http://xmlns.com/foaf/0.1/depiction"]["@id"];
    });

    if ($scope.image == undefined){
      ProcessGraph.getWikiImageLabel($scope.title.replace(" ","_")).then(function(promise){
        $scope.image = promise.data["http://xmlns.com/foaf/0.1/depiction"]["@id"];
        console.log(promise);
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

    // Set ng-show
    $scope.showData = 1;
    $scope.loading = 0;



  });

  
  var reDragSideMenus = function (){
    $ionicSideMenuDelegate.canDragContent(true);
  }

  $scope.unSetDragging = function () {
    $ionicSideMenuDelegate.canDragContent(false);
    $timeout(reDragSideMenus,3000);
  }

  $scope.contentClick = function (){
    reDragSideMenus();
  }

});


//PUBMED
module.controller('PubmedCtrl', function($scope, $stateParams, $ionicSideMenuDelegate, $timeout, Queryer, ProcessGraph, DatasetStore, QuickLinks, Utilities, FavoriteService) {

  $scope.uri = $stateParams.uri;

  // Set ng-show
  $scope.showData = 0;
  $scope.loading = 1;

  // Query the graph data from mobile.bio2rdf.org
  Queryer.setQuery('pubmed' ,'describe', 'json-ld', {"uri" : $scope.uri});
  Queryer.getJson().success(function(data){

    var idList = ProcessGraph.graph(data);
    var main = idList[$stateParams.uri]

    $scope.data=main;

    if(! main) {
      $scope.title = "Article Not Found"
    } else {

      $scope.authors = [];
      _.each(idList, function(elem) {
        if (elem["@id"].indexOf("_AUTHOR_") > -1) {
          var t = elem["@id"].split("_");
          var index = parseInt(t[t.length-1]);
          $scope.authors[index-1] = elem["rdfs:label"];
        }
      });

      var prefix = "bm:m_vocabulary:pubmed_";
      var infoOrder = [{label: "Title: ", predicate: "journalTitle"},
                       {label: "Volume: ", predicate:  "journalVolume"},
                       {label: "Issue: ", predicate: "journalIssue"},
                       {label: "Publication Date: ", predicate: "publicationDate"}];
      var citation = "";

      $scope.journalInfo = [];
      for (var i in infoOrder) {
        if (main[prefix+infoOrder[i].predicate] != undefined){
          var value = main[prefix+infoOrder[i].predicate];
          if (main[prefix+infoOrder[i].predicate] instanceof Array) {
            value = main[prefix+infoOrder[i].predicate][0];
          }
          $scope.journalInfo.push({info: infoOrder[i].label, val: value});
        }
      }

      $scope.title = Utilities.capitalize(main["rdfs:label"]);
    }

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

    $scope.lookupBookmarkState();
    // -----------------------

    QuickLinks.addLink({uri:$scope.uri, label: $scope.title, db: DatasetStore.current[0]});
    
    // Set ng-show
    $scope.showData = 1;
    $scope.loading = 0;


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

//DRUGBANK
module.controller('DrugBankCtrl', function($scope, $stateParams, $ionicSideMenuDelegate, $timeout, Queryer, ProcessGraph, DatasetStore, QuickLinks, Utilities, FavoriteService) {

  var removedLabelID = function (label) {
    return label.replace(/\[drugbank_resource:.*/g, "");
  }
  
  $scope.cleanCalcProp = function (label) {
    var outHTML = removedLabelID(label);
    var out = outHTML.split(":");
    return " <b> " + out[0] + ": </b> "  + out.splice(1,out.length-1) + "</span>";
  }

  var checkDataAvailibility = function (data, id) {
    var out = "No Data Available";

    if(data[id]){
      if(data[id] instanceof Array){
        out = "<ul style='list-style-type:circle'>";
        for (i in data) {
          out += "<li style='padding:5px'>";
          if (data[i]["@value"]) {
            out += removedLabelID(data[i]["@value"]);
          } else {
            out += removedLabelID(data[i]);
          }
          out += "</li>";
        }
        out += "</ul>";
        // out = data.join(", ");
      } else {
        if(data[id]["@value"]) {
          out = data[id]["@value"];
        } else {
          out = data;
        }
      }
    }
    return out;
  }


  $scope.uri = $stateParams.uri;
  $scope.image="http://structures.wishartlab.com/molecules/"+$stateParams.uri.split(":")[2]+"/image.png";

  // Set ng-show
  $scope.showData1 = 0;
  $scope.loading = 1;
  // Section Result Div
  $scope.section4 = 0;
  $scope.section5 = 0;
  $scope.section6 = 0;
  $scope.section7 = 0;
  $scope.section8 = 0;
  // Section Loading div
  $scope.loadSectionDiv4 = 0;
  $scope.loadSectionDiv5 = 0;
  $scope.loadSectionDiv6 = 0;
  $scope.loadSectionDiv7 = 0;
  $scope.loadSectionDiv8 = 0;


  // Query the graph data from mobile.bio2rdf.org
  Queryer.setQuery('drugbank' ,'describe', 'json-ld', {"uri" : $scope.uri});
  Queryer.getJson().success(function(data){

    // var idList=ProcessGraph.graph(data);
    // var main = idList[$stateParams.uri];
    // $scope.main=data;
    // $scope.idList=idList;

    // Section 1. Identification
    $scope.title = Utilities.capitalize(data["rdfs:label"]["@value"]);
    $scope.molType = data["bm:m_vocabulary:drugbank_molType"]["@value"];
    $scope.description = data["bm:m_vocabulary:drugbank_description"]["@value"];
    // No arrays yet for synonym.. mistake in the endpoint
    if (data["bm:m_vocabulary:drugbank_synonyms"]){
      if(data["bm:m_vocabulary:drugbank_synonyms"] instanceof Array){
        $scope.synonyms = _.values(data["bm:m_vocabulary:drugbank_synonym"]);
      } else {
        $scope.synonyms = data["bm:m_vocabulary:drugbank_synonyms"]["@value"];
      }
    }

    // Section 2. Pharmacology
    $scope.indication = checkDataAvailibility(data, "bm:m_vocabulary:drugbank_indication");
    $scope.pharmacology = checkDataAvailibility(data,"bm:m_vocabulary:drugbank_pharmacology");
    $scope.mechanism = checkDataAvailibility(data,"bm:m_vocabulary:drugbank_mechanism");
    $scope.absorption = checkDataAvailibility(data,"bm:m_vocabulary:drugbank_absorption");
    $scope.volumeDistribution = checkDataAvailibility(data,"bm:m_vocabulary:drugbank_volumeDistribution");
    $scope.proteinBinding = checkDataAvailibility(data,"bm:m_vocabulary:drugbank_proteinBinding");
    $scope.bioTransformation = checkDataAvailibility(data,"bm:m_vocabulary:drugbank_bioTransformation");
    $scope.elimination = checkDataAvailibility(data,"bm:m_vocabulary:drugbank_elimination");
    $scope.halfLife = checkDataAvailibility(data,"bm:m_vocabulary:drugbank_halfLife");
    // clearance
    $scope.toxicity = checkDataAvailibility(data,"bm:m_vocabulary:drugbank_toxicity");
    $scope.affectedOrganism = checkDataAvailibility(data,"bm:m_vocabulary:drugbank_affectedOrganism");
    // some others..

    // Section 3. Calculated Properties
    $scope.calculatedProperties = data["bm:m_vocabulary:drugbank_calculatedProperty"];

    // Section 9. See Also
    var seeAlso = [];
    if (data["rdfs:seeAlso"] instanceof Array) {
      _.each(data["rdfs:seeAlso"], function(elem) {
        seeAlso.push(elem["@id"]);
      });
    } else {
      if(data["rdfs:seeAlso"]["@id"]){
        seeAlso.push(data["rdfs:seeAlso"]["@id"]);
      }
    }
    $scope.seeAlso = seeAlso;


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

    $scope.lookupBookmarkState();
    // -----------------------

    QuickLinks.addLink({uri:$scope.uri, label: $scope.title, db: DatasetStore.current[0]});

    // Set ng-show
    $scope.showData1 = 1;
    $scope.loading = 0;
    // Section Loading Div
    $scope.loadSectionDiv4 = 1;
    $scope.loadSectionDiv5 = 1;
    $scope.loadSectionDiv6 = 1;
    $scope.loadSectionDiv7 = 1;
    $scope.loadSectionDiv8 = 1;

  });


  // Other sections (load on demand)

  // Section 4. Pharmacoeconomics
  $scope.loadSection4 = function () {

    $scope.loadSectionDiv4 = 0;
    $scope.section4 = 1;
    $scope.section4loading = 1;
    $scope.section4data = 0;

    Queryer.setQuery('drugbank' ,'describePharmEco', 'json-ld', {"uri" : $scope.uri});
    Queryer.getJson().success(function(data){

      var idList = ProcessGraph.graph(data);
      var main = idList[$stateParams.uri];

      var manufacturers = "";
      if (main['bm:m_vocabulary:drugbank_manufacturer'] instanceof Array) {
        manufacturers = "<ul>";
        _.each(main['bm:m_vocabulary:drugbank_manufacturer'], function(elem) {
          manufacturers += "<li>";
          manufacturers += elem;
          manufacturers += "</li>";
        });
        manufacturers += "</ul>";
      } else {
        manufacturers = main['bm:m_vocabulary:drugbank_manufacturer'];
      }

      var products = "";
      if (main['bm:m_vocabulary:drugbank_product'] instanceof Array) {
        _.each(main['bm:m_vocabulary:drugbank_product'], function(elem) {
          products += "<div class='row'>";
          products += "<div class='col col-50'>";
          products += removedLabelID(idList[elem["@id"]]['bm:m_vocabulary:drugbank_productLabel']["@value"]);
          products += "</div>";
          products += "<div class='col'>";
          products += idList[elem["@id"]]['bm:m_vocabulary:drugbank_productPrice']["@value"] + "  $ USD";
          products += "</div>";
          products += "</div>";
        });
      } else {
        products += "<div class='row'>";
        products += "<div class='col col-50'>";
        products += removedLabelID(idList[elem["@id"]]['bm:m_vocabulary:drugbank_productLabel']["@value"]);
        products += "</div>";
        products += "<div class='col'>";
        products += idList[elem["@id"]]['bm:m_vocabulary:drugbank_productPrice']["@value"] + "  $ USD";
        products += "</div>";
        products += "</div>";
      }


      var dosages = "";      
      if (main['bm:m_vocabulary:drugbank_dosage'] instanceof Array) {
        dosages = "<ul>";
        _.each(main['bm:m_vocabulary:drugbank_dosage'], function(elem) {
          dosages += "<li>";
          dosages += elem["@value"];
          dosages += "</li>";
        });
        dosages += "</ul>";
      } else {
        dosages = main['bm:m_vocabulary:drugbank_dosage'];
      }

      var patents = "";  
      if (main['bm:m_vocabulary:drugbank_patent'] instanceof Array) {
        console.log(main['bm:m_vocabulary:drugbank_patent']);
        _.each(main['bm:m_vocabulary:drugbank_patent'], function(elem) {
          patents += "<div class='row'>";
          patents += "<div class='col col-50'>";
          // patents += elem["@id"];
          patents += idList[elem["@id"]]['bm:m_vocabulary:drugbank_patentLabel']["@value"];
          patents += "</div>";
          patents += "<div class='col col-25'>";
          patents += "Approved: <br>" + idList[elem["@id"]]['bm:m_vocabulary:drugbank_patentApproved']["@value"];
          patents += "</div>";
          patents += "<div class='col col-25'>";
          patents += "Expires: <br>" + idList[elem["@id"]]['bm:m_vocabulary:drugbank_patentExpires']["@value"];
          patents += "</div>";
          patents += "</div>";
        });
      } else {
        patents += "<div class='row'>";
        patents += "<div class='col col-50'>";
        patents += idList[main['bm:m_vocabulary:drugbank_patent']["@id"]]['bm:m_vocabulary:drugbank_patentLabel']["@value"];
        patents += "</div>";
        patents += "<div class='col col-25'>";
        patents += "Approved: <br>" + idList[main['bm:m_vocabulary:drugbank_patent']["@id"]]['bm:m_vocabulary:drugbank_patentApproved']["@value"];
        patents += "</div>";
        patents += "<div class='col col-25'>";
        patents += "Expires: <br>" + idList[main['bm:m_vocabulary:drugbank_patent']["@id"]]['bm:m_vocabulary:drugbank_patentExpires']["@value"];
        patents += "</div>";
        patents += "</div>";
      }

      // Set HTML expressions
      $scope.manufacturers = manufacturers;
      $scope.dosages = dosages;
      $scope.products = products;
      $scope.patents = patents;

      $scope.section4loading = 0;
      $scope.section4data = 1;


    });
        
  }


  // Section 5. Drug-Drug Interaction
  $scope.loadSection5 = function () {
    
    $scope.loadSectionDiv5 = 0;
    $scope.section5 = 1;
    $scope.section5loading = 1;
    $scope.section5data = 0;

    Queryer.setQuery('drugbank' ,'describeDDI', 'json-ld', {"uri" : $scope.uri});
    Queryer.getJson().success(function(data){
      graph = data["@graph"];
      var ddiInteractors = [];
      if (graph instanceof Array) {
        _.each(graph, function(elem) {
          var href = '#/tab/describe-drugbank?uri=' + "http://bio2rdf.org/" + elem['bm:m_vocabulary:drugbank_ddiInteractor']['@id'];
          var label = elem['bm:m_vocabulary:drugbank_ddiInteractorLabel']['@value'];
          var DBlogo = DatasetStore.all['drugbank'].foafDepiction;
          ddiInteractors.push({
            'href': href,
            'dblogo' : DBlogo,
            'label' : label,
            'description' : elem['bm:m_vocabulary:drugbank_ddiLabel']['@value']
          })
        });
      } else {
        
        var href = '#/tab/describe-drugbank?uri=' + "http://bio2rdf.org/" + graph['bm:m_vocabulary:drugbank_ddiInteractor']['@id'];
        var label = graph['bm:m_vocabulary:drugbank_ddiInteractorLabel']['@value'];
        var DBlogo = DatasetStore.all['drugbank'].foafDepiction;
        ddiInteractors.push({
          'href': href,
          'dblogo' : DBlogo,
          'label' : label,
          'description' : graph['bm:m_vocabulary:drugbank_ddiLabel']['@value']
        })
      }

      // Set HTML expressions
      $scope.ddiInteractors = ddiInteractors;
      $scope.section5loading = 0;
      $scope.section5data = 1;

    });
    
    
  }


  // Section 6. Targets
  $scope.loadSection6 = function () {

    $scope.loadSectionDiv6 = 0;
    $scope.section6 = 1;
    $scope.section6loading = 1;
    $scope.section6data = 0;

    Queryer.setQuery('drugbank' ,'describeTarget', 'json-ld', {"uri" : $scope.uri});
    Queryer.getJson().success(function(data){
      graph = data["@graph"];
      var targets = [];
      if (graph instanceof Array) {
        _.each(graph, function(elem) {
          var uniprotID = elem['drugbank_vocabulary:x-uniprot']['@id'].split("uniprot:")[1];
          var uniprotURI = "http://purl.uniprot.org/uniprot/" + uniprotID;
          var href = '#/tab/describe-uniprot?uri=' + uniprotURI;
          var DBlogo = DatasetStore.all['uniprot'].foafDepiction;
          var label = elem['drugbank_vocabulary:name'];
          var organism = elem['drugbank_vocabulary:organism'];
          var cellularLocation = elem['drugbank_vocabulary:cellular-location']
          var generalFunction = elem['drugbank_vocabulary:general-function'];
          var specificFunction = elem['drugbank_vocabulary:specific-function'];

          targets.push({
            'showItem' : 1,
            'href': href,
            'dblogo' : DBlogo,
            'label' : label,
            'uniprotID' : uniprotID,
            'organism' : organism,
            'cellularLocation' : cellularLocation,
            'generalFunction' : generalFunction,
            'specificFunction' : specificFunction
          })

        });
      } else {
        
        if (data['drugbank_vocabulary:x-uniprot']){

          var uniprotID = data['drugbank_vocabulary:x-uniprot']['@id'].split("uniprot:")[1];
          var uniprotURI = "http://purl.uniprot.org/uniprot/" + uniprotID;
          var href = '#/tab/describe-uniprot?uri=' + uniprotURI;
          var DBlogo = DatasetStore.all['uniprot'].foafDepiction;
          var label = data['drugbank_vocabulary:name'];
          var organism = data['drugbank_vocabulary:organism'];
          var cellularLocation = data['drugbank_vocabulary:cellular-location']
          var generalFunction = data['drugbank_vocabulary:general-function'];
          var specificFunction = data['drugbank_vocabulary:specific-function'];

          targets.push({
            'showItem' : 1,
            'href': href,
            'dblogo' : DBlogo,
            'label' : label,
            'uniprotID' : uniprotID,
            'organism' : organism,
            'cellularLocation' : cellularLocation,
            'generalFunction' : generalFunction,
            'specificFunction' : specificFunction
          })

        } else {

          targets.push({
            'showItem' : 0,
            'href': "",
            'dblogo' : "",
            'label' : "",
            'uniprotID' : "",
            'organism' : "",
            'cellularLocation' : "",
            'generalFunction' : "",
            'specificFunction' : ""
          })
          
        }
        
      }

      // Set HTML expressions
      $scope.targets = targets;
      $scope.section6loading = 0;
      $scope.section6data = 1;

    });
    
  }


  // Section 7. Enzymes
  $scope.loadSection7 = function () {

    $scope.loadSectionDiv7 = 0;
    $scope.section7 = 1;
    $scope.section7loading = 1;
    $scope.section7data = 0;

    Queryer.setQuery('drugbank' ,'describeEnzyme', 'json-ld', {"uri" : $scope.uri});
    Queryer.getJson().success(function(data){
      graph = data["@graph"];
      var enzymes = [];
      if (graph instanceof Array) {
        _.each(graph, function(elem) {
          var uniprotID = elem['drugbank_vocabulary:x-uniprot']['@id'].split("uniprot:")[1];
          var uniprotURI = "http://purl.uniprot.org/uniprot/" + uniprotID;
          var href = '#/tab/describe-uniprot?uri=' + uniprotURI;
          var DBlogo = DatasetStore.all['uniprot'].foafDepiction;
          var label = elem['drugbank_vocabulary:name'];
          var organism = elem['drugbank_vocabulary:organism'];
          var cellularLocation = elem['drugbank_vocabulary:cellular-location']
          var generalFunction = elem['drugbank_vocabulary:general-function'];
          var specificFunction = elem['drugbank_vocabulary:specific-function'];

          enzymes.push({
            'showItem': 1,
            'href': href,
            'dblogo' : DBlogo,
            'label' : label,
            'uniprotID' : uniprotID,
            'organism' : organism,
            'cellularLocation' : cellularLocation,
            'generalFunction' : generalFunction,
            'specificFunction' : specificFunction
          })

        });
      } else {

        if (data['drugbank_vocabulary:x-uniprot']){

          var uniprotID = data['drugbank_vocabulary:x-uniprot']['@id'].split("uniprot:")[1];
          var uniprotURI = "http://purl.uniprot.org/uniprot/" + uniprotID;
          var href = '#/tab/describe-uniprot?uri=' + uniprotURI;
          var DBlogo = DatasetStore.all['uniprot'].foafDepiction;
          var label = data['drugbank_vocabulary:name'];
          var organism = data['drugbank_vocabulary:organism'];
          var cellularLocation = data['drugbank_vocabulary:cellular-location']
          var generalFunction = data['drugbank_vocabulary:general-function'];
          var specificFunction = data['drugbank_vocabulary:specific-function'];

          enzymes.push({
            'showItem': 1,
            'href': href,
            'dblogo' : DBlogo,
            'label' : label,
            'uniprotID' : uniprotID,
            'organism' : organism,
            'cellularLocation' : cellularLocation,
            'generalFunction' : generalFunction,
            'specificFunction' : specificFunction
          })

        } else {

          targets.push({
            'showItem' : 0,
            'href': "",
            'dblogo' : "",
            'label' : "",
            'uniprotID' : "",
            'organism' : "",
            'cellularLocation' : "",
            'generalFunction' : "",
            'specificFunction' : ""
          }) 

        }

      }
      // Set HTML expressions
      $scope.enzymes = enzymes;
      $scope.section7loading = 0;
      $scope.section7data = 1;

    });
    
  }


  // Section 8. Transporters
  $scope.loadSection8 = function () {

    $scope.loadSectionDiv8 = 0;
    $scope.section8 = 1;
    $scope.section8loading = 1;
    $scope.section8data = 0;

    Queryer.setQuery('drugbank' ,'describeTransporter', 'json-ld', {"uri" : $scope.uri});
    Queryer.getJson().success(function(data){
      graph = data["@graph"];
      var transporters = [];
      if (graph instanceof Array) {
        _.each(graph, function(elem) {
          var uniprotID = elem['drugbank_vocabulary:x-uniprot']['@id'].split("uniprot:")[1];
          var uniprotURI = "http://purl.uniprot.org/uniprot/" + uniprotID;
          var href = '#/tab/describe-uniprot?uri=' + uniprotURI;
          var DBlogo = DatasetStore.all['uniprot'].foafDepiction;
          var label = elem['drugbank_vocabulary:name'];
          var organism = elem['drugbank_vocabulary:organism'];
          var cellularLocation = elem['drugbank_vocabulary:cellular-location']
          var generalFunction = elem['drugbank_vocabulary:general-function'];
          var specificFunction = elem['drugbank_vocabulary:specific-function'];

          transporters.push({
            'showItem': 1,
            'href': href,
            'dblogo' : DBlogo,
            'label' : label,
            'uniprotID' : uniprotID,
            'organism' : organism,
            'cellularLocation' : cellularLocation,
            'generalFunction' : generalFunction,
            'specificFunction' : specificFunction
          })

        });
      } else {

        if (data['drugbank_vocabulary:x-uniprot']){


          var uniprotID = data['drugbank_vocabulary:x-uniprot']['@id'].split("uniprot:")[1];
          var uniprotURI = "http://purl.uniprot.org/uniprot/" + uniprotID;
          var href = '#/tab/describe-uniprot?uri=' + uniprotURI;
          var DBlogo = DatasetStore.all['uniprot'].foafDepiction;
          var label = data['drugbank_vocabulary:name'];
          var organism = data['drugbank_vocabulary:organism'];
          var cellularLocation = data['drugbank_vocabulary:cellular-location']
          var generalFunction = data['drugbank_vocabulary:general-function'];
          var specificFunction = data['drugbank_vocabulary:specific-function'];

          transporters.push({
            'showItem': 1,
            'href': href,
            'dblogo' : DBlogo,
            'label' : label,
            'uniprotID' : uniprotID,
            'organism' : organism,
            'cellularLocation' : cellularLocation,
            'generalFunction' : generalFunction,
            'specificFunction' : specificFunction
          })

        } else {

          transporters.push({
            'showItem': 0,
            'href': "",
            'dblogo' : "",
            'label' : "",
            'uniprotID' : "",
            'organism' : "",
            'cellularLocation' : "",
            'generalFunction' : "",
            'specificFunction' : ""
          })

        }


      } 

      // Set HTML expressions
      $scope.transporters = transporters;
      $scope.section8loading = 0;
      $scope.section8data = 1;

    });



    
    
  }


  // Section 9. Xref
  $scope.loadSection9 = function () {
    
    
  }


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
module.controller('UniprotCtrl', function($scope, $stateParams, $ionicSideMenuDelegate, $timeout, Queryer, ProcessGraph, DatasetStore, QuickLinks, Utilities, FavoriteService) {

  $scope.uri = $stateParams.uri;
  $scope.datasets = DatasetStore.all;

  // Set ng-show
  $scope.showData = 0;
  $scope.loading = 1;


  // Query the graph data from mobile.bio2rdf.org
  Queryer.setQuery('uniprot' ,'describe', 'json-ld', {"uri" : $scope.uri});
  Queryer.getJson().success(function(data){
    var main = undefined;
    var idList = undefined;
    if (data["@graph"] != undefined) {
      idList = ProcessGraph.graph(data);
      main = idList[$stateParams.uri];
    } else {
      main = data;
    }

    $scope.main=main;
    $scope.title = main["rdfs:label"];

    var annotations = [];
    _.each(main["bm:m_vocabulary:uniprot_hasAnnotation"], function(elem) {
      var elemid = elem;
      if (elem["@id"] != undefined) {
        elemid = elem["@id"];
      }
      if(idList[elemid]['bm:m_vocabulary:uniprot_annotationType']){
        annotations.push({
          key: idList[elemid]['bm:m_vocabulary:uniprot_annotationType'],
          val: idList[elemid]['bm:m_vocabulary:uniprot_annotation']
        })
      }
    });
    $scope.annotations = _.groupBy(_.uniq(annotations, function(obj) {return obj.val}), function(elem) {return elem.key});
    // $scope.annotations = _.uniq(annotations, function(obj) {return obj.val});

    var classifications = [];
    var GOclasses = [];
    _.each(main["bm:m_vocabulary:uniprot_hasClassification"], function(elem) {
      var elemid = elem;
      if (elem["@id"] != undefined) {
        elemid = elem["@id"];
      }
      if(idList[elemid]['bm:m_vocabulary:uniprot_classificationCategory']){
        classifications.push({
          key: idList[elemid]['bm:m_vocabulary:uniprot_classificationCategory'],
          val: idList[elemid]['bm:m_vocabulary:uniprot_classification']
        })
      } else {
        GOclasses.push({
          uri: idList[elemid]["@id"].replace("http://purl.uniprot.org/go/","http://purl.obolibrary.org/obo/GO_"),
          label: idList[elemid]['bm:m_vocabulary:uniprot_classification']
        });
      }
    });
    $scope.classifications = _.groupBy(_.uniq(classifications, function(obj) {return obj.val}), function(elem) {return elem.key});
    $scope.GOclasses = GOclasses;

    var references = [];
    _.each(main["bm:m_vocabulary:uniprot_hasReference"], function(elem) {
      var elemid = elem;
      if (elem["@id"] != undefined) {
        elemid = elem["@id"];
      }
      if(idList[elemid]['bm:m_vocabulary:uniprot_pubTitle']){
        references.push({
          uri: elemid.replace("http://purl.uniprot.org/citations/", "http://bio2rdf.org/pubmed:"),
          title: idList[elemid]['bm:m_vocabulary:uniprot_pubTitle'],
          journal: idList[elemid]['bm:m_vocabulary:uniprot_pubJournal'],
          date:idList[elemid]['bm:m_vocabulary:uniprot_pubDate']["@value"]
        })
      }
    });
    $scope.references = references;

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

    $scope.lookupBookmarkState();
    // -----------------------

    QuickLinks.addLink({uri:$scope.uri, label: $scope.title, db: DatasetStore.current[0]});

    // Set ng-show
    $scope.showData = 1;
    $scope.loading = 0;

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


//Cochrane
module.controller('CochraneCtrl', function($scope, $stateParams, $ionicSideMenuDelegate, $timeout, Queryer, ProcessGraph, DatasetStore, QuickLinks, Utilities, FavoriteService) {

  $scope.uri = $stateParams.uri;

  if($scope.uri.indexOf("cochrane:CD") > -1){
    Queryer.setQuery('cochrane' ,'describe', 'json-ld', {"uri" : $scope.uri});
  } else if ($scope.uri.indexOf("md5:") > -1) {
    Queryer.setQuery('cochrane' ,'describe_concept', 'json-ld', {"uri" : $scope.uri});
  } else {
    Queryer.setQuery('cochrane' ,'describe_author', 'json-ld', {"uri" : $scope.uri});
  }


  // Set ng-show
  $scope.showData = 0;
  $scope.loading = 1;


  // Query the graph data from mobile.bio2rdf.org
  // Queryer.setQuery('cochrane' ,'describe', 'json-ld', {"uri" : $scope.uri});

  Queryer.getJson().success(function(data){

    var idList = ProcessGraph.graph(data);
    var main = idList[$stateParams.uri]

    $scope.data=main;
    $scope.title = Utilities.capitalize(main["rdfs:label"]);

    $scope.authors = [];
    $scope.author = 0;
    _.each(main["http://schema.org/author"], function(elem) {
      $scope.authors.push(idList[elem["@id"]]);
      $scope.review = 1;
    });


    $scope.concepts = [];
    $scope.conceptShow = 0;
    _.each(main["rdfs:seeAlso"], function(elem){
      console.log(elem);

      if (typeof elem == "string") {
        $scope.concepts.push(idList[elem]);
        console.log(idList[elem]);
      } else {
        if (idList[elem["@id"]] != undefined) {
          $scope.concepts.push(idList[elem["@id"]]);
          console.log(idList[elem["@id"]]);
        }
      }

      $scope.conceptShow = 1;

    });



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

    $scope.lookupBookmarkState();
    // -----------------------


    QuickLinks.addLink({uri:$scope.uri, label: $scope.title, db: DatasetStore.current[0]});

    // Set ng-show
    $scope.showData = 1;
    $scope.loading = 0;

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
