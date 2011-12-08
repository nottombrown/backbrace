(function() {
  var ExampleItemView;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  ExampleItemView = (function() {
    __extends(ExampleItemView, Backbone.View);
    function ExampleItemView() {
      ExampleItemView.__super__.constructor.apply(this, arguments);
    }
    ExampleItemView.prototype.initialize = function() {
      this.autoBind();
      return this.template = _.template($('#tpl-item-view').html());
    };
    ExampleItemView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    };
    return ExampleItemView;
  })();
  window.init = function() {
    var exampleListView, widgets;
    widgets = new Backbone.Collection;
    exampleListView = new Backbrace.ListView({
      itemView: ExampleItemView,
      collection: widgets,
      el: $('#widget-list')
    });
    return widgets.reset([
      {
        name: 'Foo Widget',
        weight: 30
      }, {
        name: 'Bar Widget',
        weight: 15
      }
    ]);
  };
  $(function() {
    return init();
  });
}).call(this);
