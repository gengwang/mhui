'use strict';

/**
 * @ngdoc directive
 * @name mhUI.directive:mhNaviList
 * @description
 * # mhNaviList
 TODO: Support for HTML feeding data.
 */
angular.module('mhUI')
  .directive('mhNaviList', ['$timeout',  function (timer) {
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: {
            /* Data provider for this control. In the format of {items:[{header:'File', icon:'...', items:[...]}]}
            TODO: Support for HTML feeding data.*/
            menuTree:'=',
            /* Current path in the format of an array, e.g., [0,2,1]. Determines where the current view and selection goes.
            The view shows the nodes at that level; If the node is a leaf node, it also selects the item on the position. 
            */
            path:'=',
            /* Determines how we are displayed, e.g., both icons+labels; icons only; labels only (not supported). It has 2 possible values: 'full', 'icons'.*/
            menuState:'=',
            /* Callback for the user when the path is changed. Clicking a disabled node doesn't cause a path change. To callback in the client code, use: <mh-navi-list path-changed="pathChanged(node, path)" .../> in the HTML. node.header returns the header.*/
            pathChanged:'&'
        }, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '<div class="navi-list">'
        //             +'<ol ng-repeat="items in menuView">'
        //                +'<li ng-repeat="item in items"'
        //                +' ng-click= handleClick(this)'
        //                + ' ng-class="liClass(this)">{{item.header}} '
        //                // +' ng-style={background: pink} '
        //                +'</li>'
        //             +'</ol>'
        //           +'</div>',
        templateUrl: 'scripts/directives/templates/naviList.html',
        replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
      restrict: 'E',
      // link: function postLink(scope, element, attrs) {
      //   element.text('This is a Navi List!');
      // }
      link: function($scope, iElm, iAttrs, controller) {
            $scope.$watch('menuTree', function(newVal, oldVal){
                // TODO: We want this to be only called when the component is initialized but here it seems to watch the 'menuTree' property. On a second thought, even we construct menuTree property more economically, isn't the DOM tree still going to be re-rendered completely?
                _markPathsForNodes();
            });

            $scope.$watch('path', function(newVal, oldVal){
                if(!_nodeWithPathAtMenuTree($scope.menuTree, newVal)) {
                    throw('mhNaviList:: invalid path '+newVal);
                }
                if($scope.pathChanged){
                    var node = _nodeWithPathAtMenuTree($scope.menuTree, newVal);
                    // TODO(?): oldPath, oldHeader, drillDirection?
                    $scope.pathChanged(
                    {
                       header: node.header,
                       path: newVal
                    });
                }
                _render();
            });

            $scope.$watch('menuState', function(newVal, oldVal){
                // console.log('menu state:: '+newVal);
                // if(oldVal == newVal) return;

                // We do this because we don't have a class style named "menu_state_full" but we want our menu state default to "full".
                if(newVal == undefined) {
                    newVal = "full";
                };
                newVal = newVal.toLowerCase();
                // 'label' state is not supported for now. 'full' and null/undefined is actually the same because we don't have a class style named "menu_state_full".
                var allStates = ['full', 'icon', 'label'].join('').toLowerCase();

                if(allStates.indexOf(oldVal) >= 0)
                    $(iElm).toggleClass('menu_state_'+oldVal, false);

                if(allStates.indexOf(newVal) >= 0)
                    $(iElm).toggleClass('menu_state_'+newVal, true);

                _render();
            });

            var _render = function(){
                 _createMenuView();
                // TODO: First need to figure out if the path is valid.
                timer(function(){
                    // TODO: We need a UI test (attach element to window in karma test) to make sure the offset is correct.
                    var olEl = $(iElm).find('ol');
                    var offset = ($scope.menuView.length - 1) * olEl.outerWidth()*(-1);
                    iElm.css('margin-left', offset+'px');
                });
            };
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
                    if(node.disabled) return;
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

                if (!$scope.path || !$scope.path.length || $scope.path.length - 1 < pIndex || 0 > pIndex) {
                    return false;
                }

                return (pIndex === 0)? $scope.path[pIndex] == index: $scope.path[pIndex] == index - 1;
            };
            var _isDisabled = function(el){
                return el.item != undefined && el.item.disabled;
            };
            var _isNonLeaf = function(el){
                return el.item != undefined && el.item.items != undefined && el.item.items.length > 0;
            }
            $scope.liClass = function(el){
                return {
                        'heading': _isHeading(el),
                        'active': _isActive(el),
                        'disabled': _isDisabled(el),
                        };
            };
            $scope.iconUrl = function(el){
                return el.item.icon? {'background-image': 'url('+el.item.icon+')'} : {};
            };
            $scope.handleClick = function(el){
                if(el.item.disabled){return;}
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
      }
    };
  }]);