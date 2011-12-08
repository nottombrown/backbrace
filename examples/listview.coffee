
class ExampleItemView extends Backbone.View
  initialize: ->
    @autoBind()
    @template = _.template($('#tpl-item-view').html())
  render: ->
    $(@el).html(@template(@model.toJSON()))
    return @

window.init = ->
  widgets = new Backbone.Collection
  exampleListView = new Backbrace.ListView
    itemView: ExampleItemView
    collection: widgets
    el: $('#widget-list')
  widgets.reset [
    name: 'Foo Widget'
    weight: 30
  ,
    name: 'Bar Widget'
    weight: 15
  ]

$ ->
  init()