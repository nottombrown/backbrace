# auto_bind() for Backbone initializers, thanks to
# http://sulf.me/2011/07/sick-of-backbone-js-_bindall/
AutoBind =
  auto_bind: ->
    fns = _.functions(@constructor.prototype)
    protofns = _.without(
      ['auto_bind', 'constructor'].concat(
        _.functions(Backbone.Collection.prototype),
        _.functions(Backbone.Model.prototype),
        _.functions(Backbone.View.prototype)
      ),
      'render') # /do/ bind render() even though it's in View's prototype
    _.each fns, (f) =>
#        if f.charAt(0) != '_' && _.indexOf(protofns, f) == -1
      if _.indexOf(protofns, f) == -1
        @[f] = _.bind(@[f], @)
_.extend(Backbone.Collection.prototype, AutoBind)
_.extend(Backbone.Model.prototype, AutoBind)
_.extend(Backbone.View.prototype, AutoBind)

window._.supplement = (obj) ->
  _.each Array.prototype.slice.call(arguments, 1), (source) ->
    for prop, val of source
      if val != 0 and !(obj[prop]?)
        obj[prop] = val
  return obj

window.Backbrace = {}

# Based on http://pastie.org/2286356
class window.Backbrace.Subset
  models: []
  constructor: (options) ->
    @parent = options?.parent
    @filterfn = options?.filterfn
    if not (@parent instanceof Backbone.Collection or @parent instanceof Backbrace.Subset)
      throw 'Required option: parent must be a Collection or Subset.'
    if typeof @filterfn != 'function'
      throw 'Required option: filter must be function mapping Model to boolean.'

    @options = options
    delete @options.parent
    delete @options.filterfn
    @_bind()
    @_reset()
    @initialize(@options)
  _bind: ->
    that = this
    @parent.bind 'all', (evt) ->
      a = arguments[1]
      switch evt
        when 'add', 'remove'
          if that.filterfn(a)
            that.trigger.apply(that, arguments)
            that._reset()
        when 'refresh'
          that._reset()
        else
          if evt.indexOf('change') == 0
            if that.getByCid(a)
              if !that.filterfn(a)
                that._reset()
                that.trigger('remove', a, that)
              else
#                  that._reset()
                that.trigger.apply(that, arguments)
            # New element
            if !that.getByCid(a) and that.filterfn(a)
              that._reset()
              that.trigger('add', a, that)
    @_boundOnModelEvent = _.bind(@_onModelEvent, this)
  initialize: (options) ->
  _reset: ->
    @model = @parent.model
    @models = @_models()
    @length = @models.length
  _models: ->
    return _.filter(@parent.models, @filterfn)
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
#    length: ->
#      return @models.length
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


# Binds to a collection (parent) and a list of model IDs (indices);
# presents the interface of a collection containing the models whose
# IDs are listed.  Can also bind to a property of a model.  The only
# caveat is that changes to the property will trigger a 'reset'
# event (via Subset.update()) instead of add/remove events.
class window.Backbrace.IndexedSubset
  models: []
  indices: []
  constructor: (options) ->
    @auto_bind()
    @parent = options?.parent
    if not (@parent instanceof Backbone.Collection or @parent instanceof Backbrace.Subset)
      throw 'Required option: parent must be a Collection or Subset.'

    @indices = options?.indices
    if !(@indices)
      @object = options?.object
      @property = options?.property
      if !(@object)
        throw 'No indices given, but also no object'
      if !(@property)
        throw 'No indices given, but also no property'
      @indices = @object.get(@property)
      @object.bind('change:'+@property, @update)
    if !(@indices)
      throw 'No indices provided; or, object property not present'

    @options = options
    delete @options.parent
    delete @options.object
    delete @options.property
    delete @options.indices
    @_bind()
    @_reset()
    @initialize(@options)
  update: ->
    if @object
      @indices = @object.get(@property)
    @_reset()
    @trigger('reset', this)
    return this
  _models: ->
    that = this
    return _.filter(@parent.models, (obj) -> return obj.id in that.indices)
_.supplement(Backbrace.IndexedSubset.prototype, Backbrace.Subset.prototype)

# Binds a Backbone collection to a DataTables table.  The columns
# should have mDataProp defined and equal to the appropriate model
# attribute.
class window.Backbrace.Tableview extends Backbone.View
  collection: null
  table_options: null
  datatable: null
  initialize: (options) ->
    @auto_bind()
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

  # Two working examples of table view use.  We have to have the table
  # created and inserted into its parent before calling dataTable()
  # since the constructor tries to wrap the element.
  # window.initb = ->
  #   myel = $('<table></table>')
  #   $('.content').append(myel)
  #   foo = new window.TableView
  #     collection: window.Nodes
  #     el: myel
  #     table_options:
  #       aoColumns: [
  #         {sTitle: 'NodeA', mDataProp:'id'}
  #         {sTitle: 'NodeB', mDataProp:'id'}
  #         {sTitle: 'NodeC', mDataProp:'id'}
  #       ]
  #   foo.render()
  # window.initc = ->
  #   myel = $('<table></table>')
  #   $('.content').append(myel)
  #   foo = new window.NodeListView
  #     el: $('#frazzle')
  #     collection: window.Nodes
  #   foo.render()

class window.Backbrace.ListView extends Backbone.View
  collection: null
  item_view: null
  filter: null
  initialize: (options) ->
    @auto_bind()
    @el = $(@el)
    @item_view = options.item_view
    @filter = options.filter ? (model) -> true

#      if !(@item_view instanceof Backbone.View)
#        throw 'item_view: Must be Backbone.View'
    if !(typeof(@filter) == 'function')
      throw 'filter: Must be function'
    if !(@collection)# instanceof Backbone.Collection)
      throw 'collection: Must be Backbone.Collection'

    @collection = options.collection
    @collection.bind('add', @onCollectionAdd)
    @collection.bind('reset', @onCollectionReset)
    @collection.bind('change', @onCollectionChange)

#      @render()
  onCollectionAdd: (model) ->
    @render()
  onCollectionReset: ->
    @render()
  onCollectionChange: ->
    @render()

  render: ->
    @el.children(".bb-list-item").remove()
    _.each(@collection.filter(@filter), @_addItem)
    return this
  _addItem: (model) ->
    model.view = new @item_view({model: model})
    @el.append(model.view.render().el.addClass("bb-list-item"))

class window.Backbrace.TabPaneView extends Backbone.View
  initialize: (options) ->
    @auto_bind()
    @el = $('#tabpane')
    @views = options.views
    if options.default_view?
      @active_view = new @views[options.default_view]({el: @el})
  onTabChange: (tabid) ->
    @active_view = new @views[tabid]({el: @el})
    @render()
  render: ->
    @el.empty()
    @active_view?.render()
    return this

class window.Backbrace.TabBarView extends Backbone.View
  initialize: ->
    @auto_bind()
    @_wrapElement()
    @tabs = {}
    for el in @el.children('li')
      @tabs[el.id] = $(el)
    @active_tab = @el.children('li').first().attr('id')
    @update()
  _wrapElement: ->
    that = this
    @el = $('.tabs').addClass('ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all')
    @el.children('li').addClass('ui-state-default ui-corner-top')
    @el.wrap('<div class="ui-tabs ui-widget" />')
    @el.children('li').each (i, el) ->
      $(el).html('<a>'+$(el).text()+'</a>')
      $(el).children('a').bind('click', -> that.setTab(el.id))
  update: ->
    @el.children('li').removeClass('ui-tabs-selected ui-state-active')
    @tabs[@active_tab].addClass('ui-tabs-selected ui-state-active')
  setTab: (tabid) ->
    if @tabs[tabid]?
      @active_tab = tabid
      @update()
      @trigger('tabchange', tabid)
  getTab: ->
    return @active_tab

window.Backbrace.buildTabRouter = (tab_view, tab_pane_view) ->
  ext = {routes: {}}
  for tabid, tabview of tab_pane_view.views
    ext.routes[tabid] = '_tab_'+tabid
    # TODO: There has to be a cleaner way to do this, but I'm tired
    # and this works.  We have to capture the current value of
    # tabid, or all these functions switch to the last tab.
    set_tab = (_tabid) -> (-> tab_view.setTab(_tabid))
    ext['_tab_'+tabid] = set_tab(tabid)
  router = new (Backbone.Router.extend(ext))
  return router

#  window['Backbrace'] =
#    TableView: TableView
#    ListView: ListView
#    TabPaneView: TabPaneView
#    TabBarView: TabBarView
#    buildTabRouter: buildTabRouter
#  _.extend window,
#    TableView: TableView
#    ListView: ListView
#    TabPaneView: TabPaneView
#    TabBarView: TabBarView
#    buildTabRouter: buildTabRouter
