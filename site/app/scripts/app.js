'use strict';

/**
 * @ngdoc overview
 * @name mhUI
 * @description
 * # mhUI
 *
 * Main module of the application.
 */
angular
  .module('mhUI', [
    'ngAnimate',
    'ngCookies',
    'ngRoute',
    'ngTouch',
    'mhUI.naviList'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
