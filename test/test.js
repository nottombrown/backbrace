(function() {
  $(function() {
    var buildFixture, buildIndexedSubsetFixture;
    module('Subset');
    buildFixture = function() {
      var BaseSet, TestSubset;
      BaseSet = new Backbone.Collection;
      BaseSet.reset([
        {
          id: 1,
          foo: 'a'
        }, {
          id: 2,
          foo: 'b'
        }, {
          id: 3,
          foo: 'a'
        }
      ]);
      TestSubset = new Backbrace.Subset({
        parent: BaseSet,
        filterfn: function(o) {
          return 'a' === o.get('foo');
        }
      });
      return {
        parent: BaseSet,
        subset: TestSubset
      };
    };
    test('Construction', function() {
      var fixt;
      fixt = buildFixture();
      equal(fixt.parent.length, 3);
      return equal(fixt.subset.length, 2);
    });
    test('Change event propagation', function() {
      var fixt;
      fixt = buildFixture();
      fixt.subset.bind('change', function() {
        return ok(true);
      });
      fixt.parent.get(1).save({
        z: 'z'
      });
      fixt.parent.get(2).save({
        z: 'z'
      });
      return expect(1);
    });
    test('Custom event propagation from model', function() {
      var fixt;
      fixt = buildFixture();
      fixt.subset.bind('whizbang', function() {
        return ok(true);
      });
      fixt.parent.get(1).trigger('whizbang');
      fixt.parent.get(2).trigger('whizbang');
      return expect(1);
    });
    test('Add event propagation', function() {
      var fixt;
      fixt = buildFixture();
      fixt.subset.bind('add', function() {
        return ok(true);
      });
      fixt.parent.add({
        id: 4,
        foo: 'b'
      });
      fixt.parent.add({
        id: 5,
        foo: 'a'
      });
      return expect(1);
    });
    test('Change event propagation after add', function() {
      var fixt;
      fixt = buildFixture();
      fixt.subset.bind('change', function() {
        return ok(true);
      });
      fixt.parent.add({
        id: 4,
        foo: 'a'
      });
      fixt.parent.get(1).save({
        z: 'z'
      });
      return expect(1);
    });
    test('Membership updating after add', function() {
      var fixt;
      fixt = buildFixture();
      fixt.parent.add({
        id: 4,
        foo: 'a'
      });
      equal(fixt.parent.length, 4);
      return equal(fixt.subset.length, 3);
    });
    module('IndexedSubset');
    buildIndexedSubsetFixture = function() {
      var BaseSet, TestSubset, indexObject;
      BaseSet = new Backbone.Collection;
      BaseSet.reset([
        {
          id: 1,
          foo: 'a'
        }, {
          id: 2,
          foo: 'b'
        }, {
          id: 3,
          foo: 'a'
        }
      ]);
      indexObject = new Backbone.Model({
        importantModels: [1, 2],
        otherModels: [3]
      });
      TestSubset = new Backbrace.IndexedSubset({
        parent: BaseSet,
        object: indexObject,
        property: "importantModels"
      });
      return {
        parent: BaseSet,
        subset: TestSubset,
        indexObject: indexObject
      };
    };
    return test('Construction', function() {
      var fixt;
      fixt = buildIndexedSubsetFixture();
      equal(fixt.parent.length, 3);
      return equal(fixt.subset.length, 2);
    });
  });
}).call(this);
