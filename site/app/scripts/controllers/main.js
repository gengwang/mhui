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
    // icon path is relative to the js (app.js) path?
    $scope.menuTree = {items:[
                    {header:'File', icon:'../images/t_stop.png', items:[{header:'New File', icon:'../images/license_plate.png'}, {header:'Open File', icon:'../images/nav_placeholder.png'}]},
                    {header:'Edit', icon:'../images/nav_placeholder.png', items:[{header:'Copy', icon:'../images/field_init.png'}, {header:'Paste', icon:'../images/nav_placeholder.png'}, 
                    {header:'Undo Selection', icon:'../images/license_plate.png', items:[{header:'Soft Undo', icon:'../images/field_init.png'}, {header:'Undo Insert Characters', icon:'../images/t_stop.png', items:[{header:'Undo Insert All', icon:'../images/license_plate.png'}]}]}]},
                    {header:'Selection', disabled: true, icon:'../images/nav_placeholder.png', items:[{header:'Select All', icon:'../images/nav_placeholder.png'}]},
                    {header:'Find', icon:'../images/field_init.png'}
                ]};
    // $scope.path = [1,2,1,0];
    $scope.path = [1,2];

    // $scope.menuState = 'icon';

    $scope.pathChanged = function(info){
      console.log('path changed! path: '+info.path+'; header: '+info.header);
    }
  });
