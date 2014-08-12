'use strict';

describe('Directive: mhNaviList', function () {

  // load the directive's module
  // This file (test/spec/directives/mhNaviList.js)?=> ../../../app/scripts/directives/templates/naviList.html
  // App => app/scripts/directives/templates/naviList.html
  // index.html => scripts/directives/templates/
  // karma.config.js => ../app/scripts/directives/templates/naviList.html
  beforeEach(module('mhUI'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    var menuTree = {items:[
                    {header:'File', items:[{header:'New File'}, {header:'Open File'}]},
                    {header:'Edit', items:[{header:'Copy'}, {header:'Paste'}, {header:'Undo Selection', items:[{header:'Soft Undo'}, {header:'Undo Insert Characters', items:[{header:'Undo Insert All'}]}]}]},
                    {header:'Selection', items:[{header:'Select All'}]},
                    {header:'Find'}
                ]};
    scope.menuTree = menuTree;
    // scope.path = [];
    element = angular.element('<mh-navi-list path="path" menu-tree="menuTree"></mh-navi-list>');
    $compile(element)(scope);
    scope.$apply();
    return element;
  }));

  it("should expect the mock menuTree data", function() {
    expect(scope).toBeDefined();
    expect(scope.menuTree.items.length).toEqual(4);
    expect(scope.menuTree.items[0].header).toEqual('File');
  });

  it("should expect items to be marked with paths", function() {
    expect(scope.menuTree.items[3].__path).toEqual([3]);
    expect(scope.menuTree.items[1].items[2].header).toEqual('Undo Selection');
    expect(scope.menuTree.items[1].items[2].items.length).toBe(2);
    expect(scope.menuTree.items[1].items[2].items[1].items[0].header).toEqual('Undo Insert All');
    expect(scope.menuTree.items[1].items[2].items[1].items[0].__path).toEqual([1,2,1,0]);
  });

  it("should create view when the component is initialized", function() {
    expect(element.find('ol').length).toBe(1);
    expect(element.find('li').length).toBe(4);
    expect(element.find('li').eq(0).text()).toBe('File');
  });

  it("should create view based on input path", function() {
    scope.path = [];
    scope.$apply();
    // console.log('element: ', element);
    expect(element.find('ol').length).toBe(1);
    expect(element.find('li').length).toBe(4);
    expect(element.find('li').eq(3).text()).toBe('Find');
    
    scope.path = [1, 0];
    scope.$apply();
    expect(element.find('ol').length).toBe(2);
    expect(element.find('li').length).toBe(8);
    expect(element.find('li').eq(4).text()).toBe('Edit');
    expect(element.find('li').eq(5).text()).toBe('Copy');

    scope.path = [1,2,1,0];
    scope.$apply();
    expect(element.find('ol').length).toBe(4);
    expect(element.find('li').length).toBe(13);
    expect(element.find('li').eq(12).text()).toEqual('Undo Insert All');

    scope.path = [1, 2];
    scope.$apply();
    expect(element.find('ol').length).toBe(3);
    expect(element.find('li').length).toBe(11);
    expect(element.find('li').eq(0).text()).toBe('File');
    expect(element.find('li').eq(1).text()).toBe('Edit');
    expect(element.find('li').eq(4).text()).toBe('Edit');
    expect(element.find('li').eq(10).text()).toEqual('Undo Insert Characters');

    scope.path = [1,2,1,0];
    scope.$apply();
    scope.path = [3];
    scope.$apply();
    expect(element.find('ol').length).toBe(1);
  });

    // TODO. Expect error is thrown and the view doesn't change. The default should be []
  /*it("should create view for the home list if invalid path is provided", function() {
     scope.path = [1, 6];
     scope.$apply();
     expect(element.find('ol').length).toBe(1);
  });*/

  // TODO/FIXME: toHaveClass undefined. Have to use: expect(element.find('li').eq(4).attr('class')).toContain('heading'); 
  it("should have headings in the view", function() {
    scope.path = [1,2];
    scope.$apply();
    expect(element.find('li').eq(4).attr('class')).toContain('heading');
    expect(element.find('li').eq(8).attr('class')).toContain('heading');
  });

  it("should highlight all active items in the view", function() {
    scope.path = [1,2,1,0];
    scope.$apply();
    expect(element.find('li').eq(1).text()).toBe('Edit');
    expect(element.find('li').eq(1).attr('class')).toContain('active');
    expect(element.find('li').eq(7).text()).toBe('Undo Selection');
    expect(element.find('li').eq(7).attr('class')).toContain('active');
    expect(element.find('li').eq(12).text()).toBe('Undo Insert All');
    expect(element.find('li').eq(12).attr('class')).toContain('active');

    // TODO: Should not highlight any item if the path is []:
    /*scope.path = [];
    scope.$apply();
    angular.forEach(element.find('li'), function(li, i){
      for(var prop in li){
        console.log(prop+': '+li[prop])
      }
      console.log('class:: '+li.classList.length)
      expect(li.classList).toEqual(jasmine.objectContaining('ng-scope'));
    });*/
  });

  it("should drill up to the right view when a header is clicked", function(){
    // non-leaf
    scope.path = [1];
    scope.$apply();
    element.find('li').eq(4).click();
    expect(scope.path.length).toBe(0);

    // non-leaf
    scope.path = [1,2];
    scope.$apply();
    element.find('li').eq(8).click();
    expect(scope.path).toEqual([1]);

    // leaf
    scope.path = [1,2,0];
    scope.$apply();
    element.find('li').eq(8).click();
    expect(scope.path).toEqual([1]);

    // leaf
    scope.path = [1,1];
    scope.$apply();
    element.find('li').eq(4).click();
    expect(scope.path.length).toBe(0);
  });

  it("should drill down to the right view when an item is clicked", function(){
    // clicking a leaf node
    scope.path = [1,0];
    scope.$apply();
    // at [1,1]:
    element.find('li').eq(6).click();
    expect(scope.path).toEqual([1,1]);

    // clicking a non-leaf node
    scope.path = [1,0];
    scope.$apply();
    // at [1,2]:
    element.find('li').eq(7).click();
    expect(scope.path).toEqual([1,2]);
  });

  // Appears it's not loading? Or maybe timeout? http://jasmine.github.io/2.0/introduction.html
  // TODO
  /*it("should display the right icons for items", function(){
    scope.path = [1,2];
    scope.$apply();

    console.log('EL HEADING:: '+element.find('.heading').eq(0).text())
    console.log('background-image:: '+element.find('.heading').eq(0).css('width'))
    expect(element.find('.heading').eq(0).css('background-image')).toContain('png');
  })*/
});
