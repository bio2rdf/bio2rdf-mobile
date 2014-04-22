angular.module('starter.services', [])

/**
 * A simple example service that returns some data.
 */

  .constant('bio2rdfURL', "http://mobile.bio2rdf.org/")


// These VALUE queryConfig is initalized once and are being
// changed each time a query is being made (good strategy ?)
  .value('queryConfig', { "namespace" : "",
                          "method" : "",
                          "format" : "",
                          "parameters" : {}
                        }
        )

  .value('restURL', "")

// Populated from server at boot.
  .value('DatasetStore' , { 
    all: {
      "init":{foafDepiction: "img/bio2rdf.png"},
      "favorite":{foafDepiction: "img/bookmark.png"}      
    },
    current: ["init"]
  })

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



// Not done yet- managed in the Controller
  .factory('SearchService', function(){


    // Return an Array like this [ {uri: '', label: '', description ''}, {} .. ]
    var searchResultsFun = function(graph) {
      var resGraph = [];

      if(graph["@graph"] != undefined){
        subGraph = graph["@graph"];
        for (var res in subGraph){
          var result = {};
          for (var k in subGraph[res]){
            if(k=="@id"){
              result.uri = subGraph[res][k];
            }else if (k=="bm:m_vocabulary:description"){
              if(subGraph[res][k] !== null && typeof subGraph[res][k] === 'object'){
                result.description = subGraph[res][k]["@id"];
              }else {
                result.description = subGraph[res][k];
              }
            }else{
              if(subGraph[res][k] instanceof Array){
                result.label = subGraph[res][k][0];
              }else{
                result.label = subGraph[res][k];
              }
            }
          }
          resGraph.push(result);
        }

      } else {

        var uri = "";
        var description = "";
        var label = "";

        if (graph["@id"] != null){
          uri = graph["@id"];
        } else {
          return [];
        }

        if(graph["bm:m_vocabulary:description"] !== null){
          if(typeof graph["bm:m_vocabulary:description"] === 'object'){
            description = graph["bm:m_vocabulary:description"]["@id"];
          } else {
            description = graph["bm:m_vocabulary:description"];
          }
        }

        if(graph["rdfs:label"] !== null){
          label = graph["rdfs:label"];
        }

        resGraph = [{uri: uri, label: label, description: description}];
      }

      return resGraph;
    };


    var getSearchResultGraph = function () {
      return searchResultGraph;
    }

    // Will return a long (1) or short (0) search mode based on the query string
    var getQueryMode = function (queryTerm) {
      var queryMode = 'search_ns_long';
      var splitQuery = queryTerm.split(/[\s,-_]+/);
      if(splitQuery[splitQuery.length-1].length < 4){
        queryMode = 'search_ns_short';
      }
      return queryMode;
    }

    return {
      getGraphQuery: searchResultsFun,
      getSearchResults: getSearchResultGraph,
      queryMode: getQueryMode
    }

  })

// Replace Prefixes from Context in Graph pleData

  .factory('ReplacePrefixesService', function() {

    var idSplit = "";

    function traverse(context, o) {
      for (i in o) {
        if(i != "@context") {

          if (i == "@id"){
            idSplit = o[i].split(":");
            if(context[idSplit[0]] != undefined){
              o[i] = context[idSplit[0]] + idSplit.slice(1).join(":");
            }
          }
          // For predicate-
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
            if (typeof(o[i][j])=="object") {
              traverse(context, o[i][j]);
            }
          }

        }
      }
    }

    var replacePrefixFun = function (graph) {

      traverse(graph["@context"], graph);

    }

    return {
      replacePrefix: replacePrefixFun
    }

  })


  .factory('DatasetService', function(Queryer){

    var listDatabases = function () {
      Queryer.setQuery('endpoint_mother','listDB','json-ld',{});
      return Queryer;
    }

    var setUpDatasetOjb = function() {
      return "yoyo";
    }


    return {
      listDB: listDatabases,
      setUpDataset: setUpDatasetOjb
    }

  })



// Quick Links Data
  .factory('QuickLinks', function() {
    
    // A link should look like this
    //   { uri:'', label: '', db: '' }

    var quickLinks = [];

    function newLink(link) {
      var bool = true;
      
      var i = _.findIndex(quickLinks, { uri: link.uri });

      if (i == -1){
        return bool
      } else {
        quickLinks.splice(0, 0, quickLinks.splice(i, 1)[0]);
        return false;
      }
    }

    var addLink = function (link) {
      if(newLink(link)){
        quickLinks.unshift(link);
      }
    }

    var getLinks = function () {
      return quickLinks;
    }

    return {
      addLink: addLink,
      getLinks: getLinks
    }

  })

  .factory('ProcessGraph',function(ReplacePrefixesService){
    var process = function(data){
      ReplacePrefixesService.replacePrefix(data);
      uriContainer={}
      _.each(data["@graph"], function(sub){
        uriContainer[sub["@id"]]=sub;
      });
      return uriContainer;
    }
    return {
      graph : process
    }
  })


  .factory('Utilities', function(){

    var capitalize = function (string){
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return {
      capitalize: capitalize      
    }

  });
