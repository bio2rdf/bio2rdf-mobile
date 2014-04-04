// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.services', 'starter.controllers'])

  .config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
	url: "/tab",
	abstract: true,
	templateUrl: "templates/tabs.html"
      })

    // the pet tab has its own child nav-view and history
      .state('tab.search', {
      	url: '/search',
      	views: {
          'search-tab': {
            templateUrl: 'templates/search.html',
            controller: 'SearchCtrl'
          }
      	}
      })

      .state('tab.describe', {
	url: '/describe?uri&endpoint',
	views: {
          'describe-tab': {
            templateUrl: 'templates/describe.html',
	    controller: 'DescribeCtrl'
          }
	}
      })

      .state('tab.describe-null', {
      	url: '/describe',
      	views: {
          'describe-tab': {
            templateUrl: 'templates/describe-null.html'
          }
      	}
      })

      .state('tab.favorite', {
	url: '/favorite',
	views: {
          'favorite-tab': {
            templateUrl: 'templates/favorite.html'
          }
	}
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/search');

  });

