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
    var exampleListView, i;
    window.widgets = new Backbone.Collection;
    for (i = 0; i <= 19; i++) {
      widgets.add({
        id: i,
        name: 'Widget #' + i,
        weight: Math.floor(Math.random() * 35) + 5
      });
    }
    window.visibleWidgets = new Backbrace.IndexedSubset({
      parent: widgets,
      indices: widgets.pluck('id')
    });
    exampleListView = new Backbrace.ListView({
      itemView: ExampleItemView,
      collection: visibleWidgets,
      el: $('#widget-list')
    });
    $('#filter-a').click(function() {
      window.visibleWidgets.indices = [6, 15];
      return visibleWidgets.update();
    });
    $('#filter-b').click(function() {
      window.visibleWidgets.indices = [3, 4, 5, 6, 7, 8];
      return visibleWidgets.update();
    });
    return $('#filter-none').click(function() {
      window.visibleWidgets.indices = widgets.pluck('id');
      return visibleWidgets.update();
    });
  };
  $(function() {
    return init();
  });
}).call(this);
