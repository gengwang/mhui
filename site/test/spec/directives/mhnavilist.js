'use strict';

describe('Directive: mhNaviList', function () {

  // load the directive's module
  // This file (test/spec/directives/mhNaviList.js)?=> ../../../app/scripts/directives/templates/naviList.html
  // App => app/scripts/directives/templates/naviList.html
  // index.html => scripts/directives/templates/
  // karma.config.js => ../app/scripts/directives/templates/naviList.html
  beforeEach(module('mhUI'));
  beforeEach(module('scripts/directives/templates/naviList.html'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    // scope.pathChanged = jasmine.createSpy();
    var menuTree =  {items:[
                    {header:'File', icon:'../images/t_stop.png', items:[{header:'New File', icon:'../images/license_plate.png'}, {header:'Open File', icon:'../images/nav_placeholder.png'}]},
                    {header:'Edit', icon:'../images/nav_placeholder.png', items:[{header:'Copy', icon:'../images/field_init.png'}, {header:'Paste', icon:'../images/nav_placeholder.png'}, 
                    {header:'Undo Selection', icon:'../images/license_plate.png', items:[{header:'Soft Undo', icon:'../images/field_init.png'}, {header:'Undo Insert Characters', icon:'../images/t_stop.png', items:[{header:'Undo Insert All', icon:'../images/license_plate.png'}]}]}]},
                    {header:'Selection', disabled: true, icon:'../images/nav_placeholder.png', items:[{header:'Select All', icon:'../images/nav_placeholder.png'}]},
                    {header:'Find', icon:'../images/field_init.png'}
                ]};
    scope.menuTree = menuTree;
    // scope.menuState = 'icon';
    // scope.path = [];
    element = angular.element('<mh-navi-list path="path" menu-tree="menuTree" path-changed="pathChanged(header, path)"></mh-navi-list>');
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
    expect(scope.menuTree.items[1].items[2].items.length).toEqual(2);
    expect(scope.menuTree.items[1].items[2].items[1].items[0].header).toEqual('Undo Insert All');
    expect(scope.menuTree.items[1].items[2].items[1].items[0].__path).toEqual([1,2,1,0]);
  });

  it("should create view when the component is initialized", function() {
    expect(element.find('ol').length).toEqual(1);
    expect(element.find('li').length).toEqual(4);
    expect(element.find('li').eq(0).text()).toEqual('File');
  });

  it("should create view based on input path", function() {
    scope.path = [];
    scope.$apply();
    // console.log('element: ', element);
    expect(element.find('ol').length).toEqual(1);
    expect(element.find('li').length).toEqual(4);
    expect(element.find('li').eq(3).text()).toEqual('Find');
    
    scope.path = [1, 0];
    scope.$apply();
    expect(element.find('ol').length).toEqual(2);
    expect(element.find('li').length).toEqual(8);
    expect(element.find('li').eq(4).text()).toEqual('Edit');
    expect(element.find('li').eq(5).text()).toEqual('Copy');

    scope.path = [1,2,1,0];
    scope.$apply();
    expect(element.find('ol').length).toEqual(4);
    expect(element.find('li').length).toEqual(13);
    expect(element.find('li').eq(12).text()).toEqual('Undo Insert All');

    scope.path = [1, 2];
    scope.$apply();
    expect(element.find('ol').length).toEqual(3);
    expect(element.find('li').length).toEqual(11);
    expect(element.find('li').eq(0).text()).toEqual('File');
    expect(element.find('li').eq(1).text()).toEqual('Edit');
    expect(element.find('li').eq(4).text()).toEqual('Edit');
    expect(element.find('li').eq(10).text()).toEqual('Undo Insert Characters');

    scope.path = [1,2,1,0];
    scope.$apply();
    scope.path = [3];
    scope.$apply();
    expect(element.find('ol').length).toEqual(1);
  });

    // TODO. Expect error is thrown and the view doesn't change. The default should be []
  /*it("should create view for the home list if invalid path is provided", function() {
     scope.path = [1, 6];
     scope.$apply();
     expect(element.find('ol').length).toEqual(1);
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
    expect(element.find('li').eq(1).text()).toEqual('Edit');
    expect(element.find('li').eq(1).attr('class')).toContain('active');
    expect(element.find('li').eq(7).text()).toEqual('Undo Selection');
    expect(element.find('li').eq(7).attr('class')).toContain('active');
    expect(element.find('li').eq(12).text()).toEqual('Undo Insert All');
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
    expect(scope.path.length).toEqual(0);

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
    expect(scope.path.length).toEqual(0);
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

    scope.path = [1,0];
    scope.$apply();
    // at [1]:
    element.find('li').eq(1).click();
    expect(scope.path).toEqual([1]);
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
// TODO: This appears to require window as well.
  /*it("should toggle to the right menu state and the path should place the menu in the correct position", function(){
    scope.menuState = "icon";
    scope.$apply();
    expect(element.attr('class')).toContain('menu_state_icon');
  });*/
  describe('disabled items', function(){
    it('should appear disabled', function(){
      expect(element.find('li').eq(2).text()).toEqual('Selection');
      expect(element.find('li').eq(2).attr('class')).toContain('disabled');
    });

    it('should not display children items', function(){
      scope.path = [];
      scope.$apply();
      expect(element.find('ol').length).toEqual(1);
      scope.path = [2];
      expect(element.find('li').eq(2).text()).toEqual('Selection');
      element.find('li').eq(2).click();
      expect(element.find('ol').length).toEqual(1);
    })
  });
  describe("path changed callback", function() {
      beforeEach(function(){
        scope.pathChanged = jasmine.createSpy('pathChanged');
      });
      it('should call path changed callback when a non-disabled item is clicked', function(){
        scope.path = [1];
        scope.$apply();
        // We need to reset the call because pathChanged was already called when the spy is created.
        expect(element.find('li').eq(5).text()).toEqual('Copy');
        scope.pathChanged.reset();
        element.find('li').eq(5).click();
        expect(scope.pathChanged).toHaveBeenCalled();
        expect(scope.pathChanged).toHaveBeenCalledWith('Copy', [1,0]);
    });
    it('should not call path changed callback when a disabled item is clicked', function(){
        scope.path = [];
        scope.$apply();
        expect(element.find('li').eq(2).text()).toEqual('Selection');
        expect(element.find('li').eq(2).attr('class')).toContain('disabled');
        scope.pathChanged.reset();
        element.find('li').eq(2).click();
        expect(scope.path).toEqual([]);
        expect(scope.pathChanged).not.toHaveBeenCalled();
    });

    it('should call path changed callback when a header is clicked', function(){
        scope.path = [1,2,0];
        scope.$apply();
        expect(element.find('li').eq(8).text()).toEqual('Undo Selection');
        scope.pathChanged.reset();
        element.find('li').eq(8).click();
        expect(scope.pathChanged).toHaveBeenCalledWith('Edit', [1]);
        expect(element.find('li').eq(4).text()).toEqual('Edit');
        scope.pathChanged.reset();
        element.find('li').eq(4).click();
        // going back Home.
        expect(scope.pathChanged).toHaveBeenCalledWith(undefined, []);
    });
  });
  
});