class FirstTabView extends Backbone.View
  initialize: ->
  render: ->
    $(@el).text('First tab...')
    return @

class SecondTabView extends Backbone.View
  initialize: ->
  render: ->
    $(@el).text('Second tab...')
    return @

class ThirdTabView extends Backbone.View
  initialize: ->
  render: ->
    $(@el).text('Third tab...')
    return @

window.init = ->
  tabBarView = new Backbrace.TabBarView
    el: $('#tab-bar')
  tabPaneView = new Backbrace.TabPaneView
    el: $('#tab-pane')
    defaultView: 'first'
    views:
      first: FirstTabView
      second: SecondTabView
      third: ThirdTabView
  tabRouter = Backbrace.buildTabRouter(tabBarView, tabPaneView)
  tabBarView.bind 'tabchange', (tabid) ->
    tabPaneView.onTabChange(tabid)
    tabRouter.navigate(tabid)

  tabBarView.render()
  tabPaneView.render()
  Backbone.history.start()

$ ->
  init()