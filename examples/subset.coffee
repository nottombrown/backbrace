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
  widgets = new Backbone.Collection
  visibleWidgets = new Backbrace.Subset
    parent: widgets
    filterfn: (widget) -> true
  exampleListView = new Backbrace.ListView
    itemView: ExampleItemView
    collection: visibleWidgets
    el: $('#widget-list')
  for i in [0..19]
    widgets.add
      name: 'Widget #'+i
      weight: Math.floor(Math.random()*35)+5
  exampleListView.render()

  # Bind UI elements.  It's important that we call update() each time
  # we change `filterfn` so that the `Subset` knows to recompute which
  # elements of the parent collection are visible.
  $('#filter-a').click ->
    visibleWidgets.filterfn = (widget) -> widget.get('weight') > 10
    visibleWidgets.update()
  $('#filter-b').click ->
    visibleWidgets.filterfn = (widget) -> widget.get('weight') > 25
    visibleWidgets.update()
  $('#filter-none').click ->
    visibleWidgets.filterfn = (widget) -> true
    visibleWidgets.update()

$ ->
  init()