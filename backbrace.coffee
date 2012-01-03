# Automatically binds `this` for all members of the class, so that you
# don't have to call `_.bindAll` with a list of all of all of the
# functions you've defined.  Usually best to call `@autoBind()` first
# thing in `initialize`.  Thanks to [this blog
# post](http://sulf.me/2011/07/sick-of-backbone-js-_bindall/).
autoBind =
  autoBind: ->
    fns = _.functions(@constructor.prototype)
    prototype_fns = _.without(
      ['autoBind', 'constructor'].concat(
        _.functions(Backbone.Collection.prototype),
        _.functions(Backbone.Model.prototype),
        _.functions(Backbone.View.prototype)
      ),
      # Normally, we ignore functions defined in the Backbone classes.
      # However, `render()` should be bound because it's always
      # overridden (the implementation in View is just a useless
      # stub).
      'render')
    _.each fns, (f) =>
      if _.indexOf(prototype_fns, f) == -1
        @[f] = _.bind(@[f], @)

# `autoBind` is available in the prototypes of all Backbone objects.
_.extend(Backbone.Collection.prototype, autoBind)
_.extend(Backbone.Model.prototype, autoBind)
_.extend(Backbone.View.prototype, autoBind)

# Similar to `_.extend`, except that properties are not overridden.
# Each property winds up with the value provided by the left-most
# `source` (or the `destination` object itself).
window._.supplement = (destination) ->
  _.each Array.prototype.slice.call(arguments, 1), (source) ->
    for prop, val of source
      if val != 0 and !(destination[prop]?)
        destination[prop] = val
  return destination

window.Backbrace = {}

# Subset takes a `parent` collection and `filterfn`, a function that
# maps models in the parent collection to booleans.  It implements the
# same interface as the Backbone Collection class, and can be used
# interchangeably.  **Note that you must call `update()` if the
# results of `filterfn` may have changed.  This will raise the `reset`
# event.**

# The implementation is loosely based on [this
# snippet](http://pastie.org/2286356).
class window.Backbrace.Subset
  models: []
  constructor: (options) ->
    @parent = options?.parent
    @filterfn = options?.filterfn
    if not (@parent instanceof Backbone.Collection or @parent instanceof Backbrace.Subset)
      throw 'Required option: parent must be a Collection or Subset.'
    if typeof @filterfn != 'function'
      throw 'Required option: filterfn must be function mapping Model to boolean.'

    @options = options
    delete @options.parent
    delete @options.filterfn

    @_bindings = {}
    @models = []

    @_bind()
    @_reset()
    @initialize(@options)
  _bind: ->
    @parent.bind 'all', (ev, model) =>
      switch ev
        when 'add', 'remove', 'destroy'
          if @filterfn(model)
            @_reset()
            @trigger.apply(this, arguments)
        when 'error'
          if @filterfn(model)
            @trigger.apply(this, arguments)
        when 'reset'
          # This triggers the 'reset' event on the Subset and
          # refilters its contents.
          @update()
        else
          # This is a trick to catch all `change:xxx` events.  Custom
          # events are handled in `_onModelEvent`, not here.
          if ev.indexOf('change') == 0
            if @getByCid(model)
              if !@filterfn(model)
                @_reset()
                @trigger('remove', model, this)
              else
                @trigger.apply(this, arguments)
            # The element is new.
            if !@getByCid(model) and this.filterfn(model)
              @_reset()
              @trigger('add', model, this)
    @_boundOnModelEvent = _.bind(@_onModelEvent, this)
  initialize: (options) ->
  _reset: ->
    @model = @parent.model
    _.each @models, (model) =>
      model.unbind('all', @_bindings[model.id])
    @models = @_models()
    _.each @models, (model) =>
      @_bindings[model.id] = model.bind 'all', (ev) =>
        @_onModelEvent(model, ev, arguments)
    @length = @models.length
  _models: ->
    return _.filter(@parent.models, @filterfn)
  _onModelEvent: (model, ev, params) ->
    # This monstronsity just filters out stock Backbone events, which
    # are handled in `_bind`.
    switch ev
      when 'add', 'remove', 'destroy', 'reset', 'error'
        return
      else
        if ev.indexOf('change') == 0
          return
    # Custom events are forwarded if the model is a member of the
    # subset.
    if @filterfn(model)
      @trigger.apply(this, params)
  # Causes the subset to be refiltered, and also raises the reset
  # event.  Should be called if the filter is modified.
  update: ->
    @_reset()
    @trigger('reset', this)
    return this
  add: (model, options) ->
    @parent.add(model, options)
    return this
  remove: (model, options) ->
    @parent.remove(model, options)
    return this
  get: (id) ->
    return _.select(@models, (x) -> return x.id == id)[0]
  getByCid: (cid) ->
    return _.select(@models, (x) -> return x.cid == (cid.cid || cid))[0]
  at: (idx) ->
    return @models[idx]
  sort: (options) ->
    @parent.sort(options)
    return this
  pluck: (attr) ->
    return _.map(@models, (model) -> return model.get(attr))
  reset: (models, options) ->
    @parent.reset(models, options)
    return this
  fetch: (options) ->
    @parent.fetch(options)
    return this
  create: (model, options) ->
    return @parent.create(model, options)
  parse: (resp) ->
    return resp
  chain: ->
    return @parent.chain()

_.supplement(Backbrace.Subset.prototype, Backbone.Collection.prototype)

subsetMethods = [
  'forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect', 'filter',
  'select', 'reject', 'every', 'all', 'some', 'any', 'include', 'invoke', 'max',
  'min', 'sortBy', 'sortedIndex', 'toArray', 'size', 'first', 'rest', 'last',
  'without', 'indexOf', 'lastIndexOf', 'isEmpty' ]
_.each subsetMethods, (method_name) ->
  Backbrace.Subset.prototype[method_name] = ->
    return _[method_name].apply(_, [@models].concat(_.toArray(arguments)))


# Binds to a collection (`parent`) and a list of model IDs
# (`indices`); presents the interface of a collection containing the
# models whose IDs are listed.  Can also bind to a property of a
# model.  Changes to the property will trigger a `reset` event (via
# `Subset.update()`) instead of add/remove events.
class window.Backbrace.IndexedSubset extends Backbrace.Subset
  constructor: (options) ->
    @autoBind()
    @parent = options?.parent
    if not @parent?
      throw 'Required option: parent'
    @object = options?.object
    @property = options?.property
    if @object? and @property?
      @indices = @object.get(@property)
      if not @indices?
        throw 'Object property is not present.'
      @object.bind 'change:'+@property, =>
        @indices = @object.get(@property)
        @update()
    else
      @indices = options?.indices
      if not @indices?
        throw 'Required option: indices (if object, property not provided).'

    @_bindings = {}
    @models = []

    @_bind()
    @_reset()
    @initialize(@options)
  filterfn: (model) ->
    return model.id in @indices
  _models: ->
    return @parent.filter (obj) => return obj.id in @indices

class window.Backbrace.TableView extends Backbone.View
  collection: null
  table_options: null
  datatable: null
  initialize: (options) ->
    @autoBind()
    @el = $(@el)
    @table_options = options.table_options
    @_table_rows = {}

    @collection.bind('add', @_addItem)
    @collection.bind('remove', @_removeItem)
    @collection.bind('reset', @repopulate)
    @collection.bind('change', @_updateItem)
  render: ->
    @datatable = @el.dataTable(@table_options)
    @repopulate()
    return this
  repopulate: ->
    @datatable.fnClearTable()
    @collection.each(@_addItem)
  _addItem: (model) ->
    row = @datatable.fnAddData(model.toJSON())[0]
    @_table_rows[model.id] = row
  _removeItem: (model) ->
    row = @_table_rows[model.id]
    if !(row?)
      return
    @datatable.fnDeleteRow(row)
  _updateItem: (model) ->
    row = @_table_rows[model.id]
    if !(row?)
      return
    @datatable.fnUpdate(model.toJSON(), row)
    @trigger('rowchange', row, model.id, @datatable.fnGetNodes(row))

# Takes a `collection` and `itemView`, a class that implements the
# Backbone View interface.  Renders an instance of `itemView` for each
# item in the collection.
#
# The child views' elements are all given the class *bb-list-item* so
# that we can remove only those elements when clearing the list.
#
# Whenever the collection changes, all child views will be destroyed
# and recreated.  This isn't normally a problem, but might be if
# you're doing something paritcularly fancy or have a huge list.
#
# For legacy reasons, supports `filter`, an optional argument that
# maps models to a boolean value indicating whether or not they should
# be shown in the list.  The new way of doing this is with Subset.
class window.Backbrace.ListView extends Backbone.View
  collection: null
  itemView: null
  filter: null
  itemClass: "bb-list-item"
  initialize: (options) ->
    @autoBind()
    @el = $(@el)
    @itemView = options.itemView
    @filter = options.filter ? (model) -> true

    if options.itemClass?
        @itemClass = options.itemClass

    if !(typeof(@filter) == 'function')
      throw 'filter: Must be function'
    if !(@collection)# instanceof Backbone.Collection)
      throw 'collection: Must be Backbone.Collection'

    @collection = options.collection
    @collection.bind('add', @onCollectionAdd)
    @collection.bind('remove', @onCollectionRemove)
    @collection.bind('reset', @onCollectionReset)
    @collection.bind('change', @onCollectionChange)
  onCollectionAdd: (model) ->
    @render()
  onCollectionRemove: (model) ->
    @render()
  onCollectionReset: ->
    @render()
  onCollectionChange: ->
    @render()
  render: ->
    @el.children(".#{@itemClass}").remove()
    _.each(@collection.filter(@filter), @_addItem)
    return this
  _addItem: (model) ->
    model.view = new @itemView({model: model})
    @el.append($(model.view.render().el).addClass(@itemClass))
    model.view.trigger 'ready' # Let the view know it has been added to the DOM.

# Takes `views`, an object mapping tab IDs to view classes, and
# `defaultView`, one of those tab IDs.  The `TabPaneView` will create
# and render an instance of the corresponding view class.  When you
# call `onTabChange` with a new tab ID, it will destroy the old markup
# and do the same for the new view.
#
# We use this to implement the body of a tabbed view.
class window.Backbrace.TabPaneView extends Backbone.View
  initialize: (options) ->
    @autoBind()
    @el = $(@el)
    @views = options.views
    @activeView = null
    if options.defaultView?
      @onTabChange(options.defaultView)
  onTabChange: (tabid) ->
    @activeView?.remove()
    @activeView = new @views[tabid]()
    @render()
  render: ->
    @el.append @activeView?.render().el
    return this

# This implements the actual UI element that lets you change which
# child view a `TabPaneView` is displaying.  You will probably want to
# modify this for your own purposes; this one depends heavily on
# jQuery UI.  (If you're using jQuery UI want a tab bar that looks
# just like the jQuery UI one, then you're golden.)
#
# `TabBarView` expects to be given a list element that contains a
# `<li>` element for each tab.  The ID of the `<li>` element is used
# as the corresponding tab ID.
#
# Raises the `tabchange` event whenever a new selection is made.
# Binding this to the `onTabChange` property of a `TabPaneView` will
# make the two play nicely together.
class window.Backbrace.TabBarView extends Backbone.View
  initialize: ->
    @autoBind()
    @_wrapElement()
    @tabs = {}
    for el in @el.children('li')
      @tabs[el.id] = $(el)
    @activeTab = @el.children('li').first().attr('id')
    @update()
  _wrapElement: ->
    that = this
    @el.addClass('ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all')
    @el.children('li').addClass('ui-state-default ui-corner-top')
    @el.wrap('<div class="ui-tabs ui-widget" />')
    @el.children('li').each (i, el) ->
      $(el).html('<a>'+$(el).text()+'</a>')
      $(el).children('a').click -> that.setTab(el.id)
  update: ->
    @el.children('li').removeClass('ui-tabs-selected ui-state-active')
    @tabs[@activeTab].addClass('ui-tabs-selected ui-state-active')
  setTab: (tabid) ->
    if @tabs[tabid]?
      @activeTab = tabid
      @update()
      @trigger('tabchange', tabid)
  getTab: ->
    return @activeTab

# Given an instance of `TabBarView` and an instance of `TabPaneView`,
# this utility function will construct a Backbone Router for you so
# that each tab will have a corresponding hash URI.
window.Backbrace.buildTabRouter = (tabBarView, tabPaneView) ->
  ext = {routes: {}}
  for tabid, tabview of tabPaneView.views
    ext.routes[tabid] = '_tab_'+tabid
    do (tabid) ->
      ext['_tab_'+tabid] = ->
        tabBarView.setTab(tabid)
  router = new (Backbone.Router.extend(ext))
  return router
