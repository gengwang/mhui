'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('mhUI'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));
  it("should expect a controller", function() {
    expect(MainCtrl).toBeDefined();
  });
  it('should expect a scope', function(){
    expect(scope).toBeDefined();
  });
  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
  it('indexOf should return -1 for non-existent item', function () {
    expect([1,3,5].indexOf(0)).toBe(-1);
  });
});
