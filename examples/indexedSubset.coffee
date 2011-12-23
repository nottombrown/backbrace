class ExampleItemView extends Backbone.View
  initialize: ->
    @autoBind()
    @template = _.template($('#tpl-item-view').html())
  render: ->
    $(@el).html(@template(@model.toJSON()))
    return @

window.init = ->
  # This is very similar to the `ListView` example, except that we're
  # using a Subset to filter which widgets are shown by the
  # `ListView`.
  window.widgets = new Backbone.Collection
  window.visibleWidgets = new Backbrace.IndexedSubset
    parent: widgets
    indices: [6, 15]
  exampleListView = new Backbrace.ListView
    itemView: ExampleItemView
    collection: visibleWidgets
    el: $('#widget-list')
  for i in [0..19]
    widgets.add
      id: i
      name: 'Widget #'+i
      weight: Math.floor(Math.random()*35)+5

  # Bind UI elements.  It's important that we call update() each time
  # we change `filterfn` so that the `Subset` knows to recompute which
  # elements of the parent collection are visible.
  $('#filter-a').click ->
    window.visibleWidgets.indices = [6, 15]
    visibleWidgets.update()
  $('#filter-b').click ->
    window.visibleWidgets.indices = [3..8]
    visibleWidgets.update()
  $('#filter-none').click ->
    window.visibleWidgets.indices = [0..10]
    visibleWidgets.update()

$ ->
  init()