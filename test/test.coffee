$ ->
  module 'Subset'

  build_fixture = ->
    BaseSet = new Backbone.Collection;
    BaseSet.reset [
      {id: 1, foo: 'a'}
      {id: 2, foo: 'b'}
      {id: 3, foo: 'a'}
      ]
    TestSubset = new Backbrace.Subset
      parent: BaseSet
      filterfn: (o) -> 'a' == o.get('foo')
    return {
      parent: BaseSet
      subset: TestSubset
      }

  test 'Construction', ->
    fixt = build_fixture()
    equal fixt.parent.length, 3
    equal fixt.subset.length, 2

  test 'Change event propagation', ->
    fixt = build_fixture()
    fixt.subset.bind('change', -> ok(true))
    fixt.parent.get(1).save({z: 'z'})
    fixt.parent.get(2).save({z: 'z'})
    expect 1

  test 'Add event propagation', ->
    fixt = build_fixture()
    fixt.subset.bind('add', -> ok(true))
    fixt.parent.add({id: 4, foo: 'b'})
    fixt.parent.add({id: 5, foo: 'a'})
    expect 1

  test 'Change event propagation after add', ->
    fixt = build_fixture()
    fixt.subset.bind('change', -> ok(true))
    fixt.parent.add({id: 4, foo: 'a'})
    fixt.parent.get(1).save({z: 'z'})
    expect 1

  test 'Membership updating after add', ->
    fixt = build_fixture()
    fixt.parent.add({id: 4, foo: 'a'})
    equal fixt.parent.length, 4
    equal fixt.subset.length, 3
