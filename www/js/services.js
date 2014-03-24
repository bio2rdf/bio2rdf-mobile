angular.module('starter.services', [])

/**
 * A simple example service that returns some data.
 */

  .constant('bio2rdfURL', "http://mobile.bio2rdf.org/")

  .value('queryConfig', { "namespace" : "ontobee",
			  "method" : "search_ns",
			  "format" : "json-ld",
			  "parameters" : {
			    "parm1" : "asthma",
			    "parm2" : "DOID"
			  }
			}
	)


  .factory('SearchService', function(){

    var searchResultsFun = function(context, graph) {
      
    }

  })


  .factory('RestUrlBuilderService', function(bio2rdfURL) {

    var buildRestURL = function(urlConfig) {
      var params = "";
      for (var k in urlConfig.parameters) {
	if(params.length > 0){
    	  params += "&";
	}
	params += k + "=" + urlConfig.parameters[k];
      }

      var url = bio2rdfURL.concat(urlConfig.namespace, "/", 
    				  urlConfig.method, "/", 
    				  urlConfig.format, "?",
    				  params
    				 );

      return encodeURI(url) + "&callback=JSON_CALLBACK";
    }

    return {
      restURL: buildRestURL
    };

  })


  .factory('GetJsonService', function($http) {

    var getJsonFun = function(url) {
      return $http.jsonp(url);
    };

    return {
      getJson: getJsonFun
    };

  })


  .factory('replacePrefixesService', function() {

    var idSplit = "";
    function traverse(context, o) {
      for (i in o) {
	if (i == "@id"){
	  // console.log();
	  idSplit = o[i].split(":");
	  o[i] = context[idSplit[0]] + idSplit[1];
	  console.log(o[i]);
	}
        if (typeof(o[i])=="object") {
          traverse(context, o[i]);
        }
      }
    }

    var replacePrefixFun = function (context, graph) {
      traverse(context, graph);
    }

    return {
      replacePrefix: replacePrefixFun
    }

  })



  .factory('DatasetsService', function(){
    
    var databases = [
      {id: 0, title: 'ChEBI', img: 'img/chebi.png', nbOfTriples: 18000},
      {id: 1, title: 'Disease Ontology', img: 'img/doid.png', nbOfTriples: 12000}
    ];
    
    return {
      all: function() {
	return databases;
      }
 
    }

  })


  .factory('PetService', function() {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var pets = [
      { id: 0, title: 'Cats', description: 'Furry little creatures. Obsessed with plotting assassination, but never following through on it.' },
      { id: 1, title: 'Dogs', description: 'Lovable. Loyal almost to a fault. Smarter than they let on.' },
      { id: 2, title: 'Turtles', description: 'Everyone likes turtles.' },
      { id: 3, title: 'Sharks', description: 'An advanced pet. Needs millions of gallons of salt water. Will happily eat you.' }
    ];

    return {
      all: function() {
	return pets;
      },
      get: function(petId) {
	// Simple index lookup
	return pets[petId];
      }
    }

  })

;

