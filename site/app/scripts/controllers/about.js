'use strict';

/**
 * @ngdoc function
 * @name mhUI.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the mhUI
 */
angular.module('mhUI')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
