angular.module('starter.services', [])

/**
 * A simple example service that returns some data.
 */
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


  .factory('RestUrlBuilderService', function() {

    var buildURL = function(urlConfig) {
      var params = "";
      for (var k in urlConfig.parameters) {
	if(params.length > 0){
    	  params += "&";
	}
	params += k + "=" + urlConfig.parameters[k];
      }

      var url = "http://mobile.bio2rdf.org/".concat(urlConfig.namespace, "/", 
    						    urlConfig.method, "/", 
    						    urlConfig.format, "?",
    						    params
    						   );
      return encodeURI(url) + "&callback=JSON_CALLBACK";
    }


    return {
      buildURL: buildURL
    };

  })


  .factory('GetJsonService', function($http) {

    var getJsonFunction = function(url) {
      return $http.jsonp(url);
    };

    return {
      getJson: getJsonFunction
    };

  });
