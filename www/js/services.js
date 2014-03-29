angular.module('starter.services', [])

/**
 * A simple example service that returns some data.
 */

  .constant('bio2rdfURL', "http://mobile.bio2rdf.org/")

  .value('queryConfig', { "namespace" : "",
			  "method" : "",
			  "format" : "",
			  "parameters" : {}
			}
	)

  .value('restURL', "")

  .value('currentDB', "")

// TODO: build a queryer to encapsulate resturlbuilder, getjson services ...
  .factory('Queryer', function(queryConfig, restURL, bio2rdfURL, $http) {

    // Utilitary Function to build the actual rest url based on the queryConfig value
    function buildRestURL() {
      var params = "";
      for (var k in queryConfig.parameters) {
	if(params.length > 0){
    	  params += "&";
	}
	params += k + "=" + queryConfig.parameters[k];
      }

      var url = bio2rdfURL.concat(queryConfig.namespace, "/", 
    				  queryConfig.method, "/", 
    				  queryConfig.format, "?",
    				  params
    				 );

      restURL = encodeURI(url) + "&callback=JSON_CALLBACK";

    }

    var setQueryConfig = function(namespace, method, format, params) { 
      queryConfig.namespace = namespace;
      queryConfig.method = method;
      queryConfig.format = format;
      queryConfig.parameters = params;
      buildRestURL();
    }

    var getJsonFun = function() {
      return $http.jsonp(restURL);
    };

    return {
      setQuery: setQueryConfig,
      getJson: getJsonFun
    }

  })


  .factory('SearchService', function(){

    var searchResultsFun = function(context, graph) {
      
    }

  })

  .factory('replacePrefixesService', function() {

    var idSplit = "";
    function traverse(context, o) {
      for (i in o) {
	      if (i == "@id"){
	      // console.log();
          idSplit = o[i].split(":");
          var uri=[]
          _(idSplit).each(function(str){
            if (context[str] != undefined){
              uri.push(context[str]);
            } else {
              uri.push(str);
            }
          });
          o[i] = uri.join(':');
	      }

	// For predicate- needed ?
	// else if (i.indexOf(":") != -1 ){
	//   idSplit = i.split(":");
	//   if(context[idSplit[0]] != undefined){
	//     i = context[idSplit[0]] + idSplit[1];
	//     console.log(i);
	//   }
	// }

        if (typeof(o[i])=="object") {
          traverse(context, o[i]);
        }
	      else if (o[i] instanceof Array) {
	        alert("Array");
	        if (typeof(o[i][j])=="object") {
            traverse(context, o[i][j]);
          }
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


  .factory('DatasetService', function(Queryer){

    var databases = [
      {id: 0, title: 'ChEBI', img: 'img/chebi.png', nbOfTriples: 18000},
      {id: 1, title: 'Disease Ontology', img: 'img/doid.png', nbOfTriples: 12000}
    ];

    var listDatabases = function () {
      Queryer.setQuery('endpoint_mother','listDB','json-ld',{});
      return Queryer;
    }

    return {
      all: function() {
	return databases;
      },
      listDB: listDatabases
    }

  })

  .factory('ProcessGraph',function(){
    var process = function(graph){
        uriContainer={}
        //_.each(graph, function(index){uriHandler[].push(graph[i]["@id"]);});
    }
    return {
      graph : process
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

