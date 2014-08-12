'use strict';

/**
 * @ngdoc function
 * @name mhUI.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mhUI
 */
angular.module('mhUI')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  })
  .controller('NaviListCtrl', function($scope){
    $scope.menuTree = {items:[
                    {header:'File', items:[{header:'New File'}, {header:'Open File'}]},
                    {header:'Edit', items:[{header:'Copy'}, {header:'Paste'}, {header:'Undo Selection', items:[{header:'Soft Undo'}, {header:'Undo Insert Characters', items:[{header:'Undo Insert All'}]}]}]},
                    {header:'Selection', items:[{header:'Select All'}]},
                    {header:'Find'}
                ]};
    // $scope.path = [1,2,1,0];
    $scope.path = [1,2];
  });
