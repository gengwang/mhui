'use strict';

/**
 * @ngdoc directive
 * @name mhUI.directive:mhNaviList
 * @description
 * # mhNaviList
 */
angular.module('mhUI')
  .directive('mhNaviList', ['$timeout',  function (timer) {
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: {
            /* Data provider for this control. In the format of {items:[{header:'File', icon:'...', items:[...]}]}*/
            menuTree:'=',
            /* current path in the format of an array, e.g., [0,2,1]. Determines where the current view and selection goes.
            The view shows the nodes at that level; If the node is a leaf node, it also selects the item on the position. 
            */
            path:'=',
        }, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        template: '<div class="navi-list">'+
                    '<ol ng-repeat="items in menuView">'+
                        '<li ng-repeat="item in items"'+
                        ' ng-click= handleClick(this)'+
                        ' ng-class="liClass(this)">{{item.header}}'+
                        '</li>'+
                    '</ol>'+
                  '</div>',
        // templateUrl: 'scripts/directives/templates/naviList.html',
        replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
      restrict: 'E',
      // link: function postLink(scope, element, attrs) {
      //   element.text('This is a Navi List!');
      // }
      link: function($scope, iElm, iAttrs, controller) {
            $scope.$watch('menuTree', function(newVal, oldVal){
                // TODO: We want this to be only called when the component is initialized but here it seems to watch the 'menuTree' property.
                _markPathsForNodes();
            });

            $scope.$watch('path', function(newVal, oldVal){
                // console.log('path changed to '+newVal)
                if(!_nodeWithPathAtMenuTree($scope.menuTree, newVal)) {
                    throw('mhNaviList:: invalid path '+newVal);
                    return;
                };

                _createMenuView();
                // TODO: First need to figure out if the path is valid, then:
                // Also need to wait until the DOM is actually rendered inside window...
                timer(function(){
                    // See if we are at non-leaf or not, if we are, then shift one more:
                    var olEl = $(iElm).find('ol');
                    var isActiveNodeNonLeaf = _isNodeNonLeaf(_nodeWithPathAtMenuTree($scope.menuTree, $scope.path))? 1 : 0;
                    var offset = (newVal.length - 1 + isActiveNodeNonLeaf) * olEl.outerWidth()*(-1);
                    iElm.css('margin-left', offset+'px');
                });

            });
            /* Helper. It traverses the treeMenu and marks all the nodes with their "path"s, which are denoted as an array. For example, [1,2,1] means the node is located at menuTere.items[1].items[2].items[1]. The 'path' is stored in the '__path' property of each node item.
            */
            var _markPathsForNodes = function(){
                // @param node: a node item in the menuTree node.
                var __markPath = function(node){
                    var basePath = node.__path || [];

                    if(node.items && node.items.length){
                         _.each(node.items, function(d, i){
                            var _tmpPath = basePath.slice();
                            _tmpPath.push(i);
                            d.__path = _tmpPath;
                        });
                         _.each(node.items, function(d, i){
                            __markPath(d);
                        });
                    }
                };
                if($scope.menuTree.items){
                    __markPath($scope.menuTree);
                }
            };
            // Helper. See if the data is a leaf node within the menuTree data,
            var _isNodeNonLeaf = function(node){
                return (node && node.items && node.items.length) || node.length > 0;
            };
            // Helper for debugging.
            var _describeItem = function(item){
              var col =  _.reduce(item, function(memo, d){
                return memo===''? d.header : memo+', '+d.header;}, '');
              return item && item.header? item.header : col;
            };
            /*
            Access to any node with the path. 
            @param path: an array, like [0,1,2,1]
            @param menuTree: needs to conform to the format of the data provider: {items:[...]}
            */            
            var _nodeWithPathAtMenuTree = function(menuTree, path){
                var r = _.reduce(path, function(memo, key){
                    return memo.items[key];}, menuTree);
                return path && path.length > 0 ? r: menuTree.items;
            };
            var _createMenuView = function(){
                // TODO: The current approach basically recreate the menuView each time the path is changed. A more sophisticated approach could be to exam the current path and the requested path and to only append or subtract a few views when possible.
                /* For example [1,3,5] at index 0 returns [1] and index 1 returns [1,3], etc.*/
                var pathAtIndex = function(path, index){
                    var d = Math.min(path.length - 1, index);
                    return _.reduce(_.range(d + 1), function(memo, i) {
                        memo.push(path[i]);
                        return memo;
                    }, []);
                };
                var _tmp = $scope.menuTree.items;
                var _out = [_tmp];
                for(var index in $scope.path){
                    var path = pathAtIndex($scope.path, index);
                    var node = _nodeWithPathAtMenuTree($scope.menuTree, path);
                    if(_isNodeNonLeaf(node)){
                        var items = node.items.slice();
                        // Add header to top of the items:
                        items.unshift(node);
                        _out.push(items);
                    }
                }
                $scope.menuView = _out;
            };
            // TODO: Can we have heading/active/disabled as scope attributes instead, like https://github.com/angular-ui/bootstrap/blob/master/src/tabs/tabs.js?
            // Helper:
            var _isHeading = function(el){
                var index = el.$index,
                    pIndex = el.$parent.$index;
                return pIndex !== 0 && index === 0;
            };
            // Helper. Determines if the li element corresponding to an angular element should be active (i.e., selected) or not. 
            var _isActive = function(el){
                var index = el.$index,
                    pIndex = el.$parent.$index;
                if (!$scope.path || !$scope.path.length || $scope.path.length - 1 < pIndex || 0 > pIndex) return false;
                if(pIndex == 0){
                    return $scope.path[pIndex] == index;
                }else{
                    return $scope.path[pIndex] == index - 1;
                }
            };
            var _isNonLeaf = function(el){
                // return el.item != undefined && el.item.items != undefined ;
                return el.item != undefined && el.item.items != undefined && el.item.items.length > 0;
            }
            $scope.liClass = function(el){
                return {
                        'heading': _isHeading(el),
                        'active': _isActive(el),
                        // 'disabled': false,
                        };
            };
            $scope.handleClick = function(el){
                // console.log(el+' is clicked! and i guess it is: '+el.item.header+'; index: '+el.$index+'; pIndex: '+el.$parent.$index+ '; path: '+el.item.__path+'; is it a leaf? '+!_isNonLeaf(el));

                var _proposedPath;
                // Determine whether we should drill up or down:
                if(_isHeading(el)){
                    // drill up
                    if(_isNonLeaf(el)){
                        _proposedPath = el.item.__path.slice(0, -1);
                    }else{
                        if(el.item.__path.length >=2 ){
                            _proposedPath = el.item.__path.slice(0, -2);
                        }else{
                            _proposedPath = el.item.__path.slice(0, -1);
                        }
                    }
                }else{ // drill down
                    _proposedPath = el.item.__path;
                }
                $scope.path = _proposedPath;
            }
            /* Go up one level. */
            $scope.drillDown = function(el){

            };
            /* Go down one level.*/
            $scope.drillUp = function(el){

            };
            /* Show or hide labels.*/
            $scope.toggleLabels = function(show){

            };
            /* Show or hide icons.*/
            $scope.toggleIcons = function(show){

            };
      }
    };
  }]);