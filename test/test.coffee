$ ->
  module 'Subset'

  buildFixture = ->
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
    fixt = buildFixture()
    equal fixt.parent.length, 3
    equal fixt.subset.length, 2

  test 'Change event propagation', ->
    fixt = buildFixture()
    fixt.subset.bind('change', -> ok(true))
    fixt.parent.get(1).save({z: 'z'})
    fixt.parent.get(2).save({z: 'z'})
    expect 1

  test 'Custom event propagation from model', ->
    fixt = buildFixture()
    fixt.subset.bind('whizbang', -> ok(true))
    fixt.parent.get(1).trigger('whizbang')
    fixt.parent.get(2).trigger('whizbang')
    expect 1

  test 'Add event propagation', ->
    fixt = buildFixture()
    fixt.subset.bind('add', -> ok(true))
    fixt.parent.add({id: 4, foo: 'b'})
    fixt.parent.add({id: 5, foo: 'a'})
    expect 1

  test 'Change event propagation after add', ->
    fixt = buildFixture()
    fixt.subset.bind('change', -> ok(true))
    fixt.parent.add({id: 4, foo: 'a'})
    fixt.parent.get(1).save({z: 'z'})
    expect 1

  test 'Membership updating after add', ->
    fixt = buildFixture()
    fixt.parent.add({id: 4, foo: 'a'})
    equal fixt.parent.length, 4
    equal fixt.subset.length, 3


  module 'IndexedSubset'

  buildIndexedSubsetFixture = ->
    BaseSet = new Backbone.Collection;
    BaseSet.reset [
      {id: 1, foo: 'a'}
      {id: 2, foo: 'b'}
      {id: 3, foo: 'a'}
      ]

    indexObject = Backbone.Model
      importantModels: [1, 2]
      otherModels: [3]

    TestSubset = new Backbrace.IndexedSubset
      parent: BaseSet
      object: indexObject
      property: "importantModels"
    
    return {
      parent: BaseSet
      subset: TestSubset
      indexObject: indexObject
      }

  test 'Construction', ->
    fixt = buildIndexedSubsetFixture()
    equal fixt.parent.length, 3
    equal fixt.subset.length, 2
