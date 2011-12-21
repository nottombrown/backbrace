(function() {
  $(function() {
    var build_fixture;
    module('Subset');
    build_fixture = function() {
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
      fixt = build_fixture();
      equal(fixt.parent.length, 3);
      return equal(fixt.subset.length, 2);
    });
    test('Change event propagation', function() {
      var fixt;
      fixt = build_fixture();
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
    test('Add event propagation', function() {
      var fixt;
      fixt = build_fixture();
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
      fixt = build_fixture();
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
    return test('Membership updating after add', function() {
      var fixt;
      fixt = build_fixture();
      fixt.parent.add({
        id: 4,
        foo: 'a'
      });
      equal(fixt.parent.length, 4);
      return equal(fixt.subset.length, 3);
    });
  });
}).call(this);