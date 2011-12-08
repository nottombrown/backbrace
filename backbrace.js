(function() {
  var autoBind, subsetMethods;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  autoBind = {
    autoBind: function() {
      var fns, prototype_fns;
      fns = _.functions(this.constructor.prototype);
      prototype_fns = _.without(['autoBind', 'constructor'].concat(_.functions(Backbone.Collection.prototype), _.functions(Backbone.Model.prototype), _.functions(Backbone.View.prototype)), 'render');
      return _.each(fns, __bind(function(f) {
        if (_.indexOf(prototype_fns, f) === -1) {
          return this[f] = _.bind(this[f], this);
        }
      }, this));
    }
  };
  _.extend(Backbone.Collection.prototype, autoBind);
  _.extend(Backbone.Model.prototype, autoBind);
  _.extend(Backbone.View.prototype, autoBind);
  window._.supplement = function(destination) {
    _.each(Array.prototype.slice.call(arguments, 1), function(source) {
      var prop, val, _results;
      _results = [];
      for (prop in source) {
        val = source[prop];
        _results.push(val !== 0 && !(destination[prop] != null) ? destination[prop] = val : void 0);
      }
      return _results;
    });
    return destination;
  };
  window.Backbrace = {};
  window.Backbrace.Subset = (function() {
    Subset.prototype.models = [];
    function Subset(options) {
      this.parent = options != null ? options.parent : void 0;
      this.filterfn = options != null ? options.filterfn : void 0;
      if (!(this.parent instanceof Backbone.Collection || this.parent instanceof Backbrace.Subset)) {
        throw 'Required option: parent must be a Collection or Subset.';
      }
      if (typeof this.filterfn !== 'function') {
        throw 'Required option: filter must be function mapping Model to boolean.';
      }
      this.options = options;
      delete this.options.parent;
      delete this.options.filterfn;
      this._bind();
      this._reset();
      this.initialize(this.options);
    }
    Subset.prototype._bind = function() {
      var that;
      that = this;
      this.parent.bind('all', function(evt) {
        var a;
        a = arguments[1];
        switch (evt) {
          case 'add':
          case 'remove':
            if (that.filterfn(a)) {
              that.trigger.apply(that, arguments);
              return that._reset();
            }
            break;
          case 'refresh':
            return that._reset();
          default:
            if (evt.indexOf('change') === 0) {
              if (that.getByCid(a)) {
                if (!that.filterfn(a)) {
                  that._reset();
                  that.trigger('remove', a, that);
                } else {
                  that.trigger.apply(that, arguments);
                }
              }
              if (!that.getByCid(a) && that.filterfn(a)) {
                that._reset();
                return that.trigger('add', a, that);
              }
            }
        }
      });
      return this._boundOnModelEvent = _.bind(this._onModelEvent, this);
    };
    Subset.prototype.initialize = function(options) {};
    Subset.prototype._reset = function() {
      this.model = this.parent.model;
      this.models = this._models();
      return this.length = this.models.length;
    };
    Subset.prototype._models = function() {
      return _.filter(this.parent.models, this.filterfn);
    };
    Subset.prototype.update = function() {
      this._reset();
      this.trigger('reset', this);
      return this;
    };
    Subset.prototype.add = function(model, options) {
      this.parent.add(model, options);
      return this;
    };
    Subset.prototype.remove = function(model, options) {
      this.parent.remove(model, options);
      return this;
    };
    Subset.prototype.get = function(id) {
      return _.select(this.models, function(x) {
        return x.id === id;
      })[0];
    };
    Subset.prototype.getByCid = function(cid) {
      return _.select(this.models, function(x) {
        return x.cid === (cid.cid || cid);
      })[0];
    };
    Subset.prototype.at = function(idx) {
      return this.models[idx];
    };
    Subset.prototype.sort = function(options) {
      this.parent.sort(options);
      return this;
    };
    Subset.prototype.pluck = function(attr) {
      return _.map(this.models, function(model) {
        return model.get(attr);
      });
    };
    Subset.prototype.reset = function(models, options) {
      this.parent.reset(models, options);
      return this;
    };
    Subset.prototype.fetch = function(options) {
      this.parent.fetch(options);
      return this;
    };
    Subset.prototype.create = function(model, options) {
      return this.parent.create(model, options);
    };
    Subset.prototype.parse = function(resp) {
      return resp;
    };
    Subset.prototype.chain = function() {
      return this.parent.chain();
    };
    return Subset;
  })();
  _.supplement(Backbrace.Subset.prototype, Backbone.Collection.prototype);
  subsetMethods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size', 'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty'];
  _.each(subsetMethods, function(method_name) {
    return Backbrace.Subset.prototype[method_name] = function() {
      return _[method_name].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });
  window.Backbrace.IndexedSubset = (function() {
    IndexedSubset.prototype.models = [];
    IndexedSubset.prototype.indices = [];
    function IndexedSubset(options) {
      this.autoBind();
      this.parent = options != null ? options.parent : void 0;
      if (!(this.parent instanceof Backbone.Collection || this.parent instanceof Backbrace.Subset)) {
        throw 'Required option: parent must be a Collection or Subset.';
      }
      this.indices = options != null ? options.indices : void 0;
      if (!this.indices) {
        this.object = options != null ? options.object : void 0;
        this.property = options != null ? options.property : void 0;
        if (!this.object) {
          throw 'No indices given, but also no object';
        }
        if (!this.property) {
          throw 'No indices given, but also no property';
        }
        this.indices = this.object.get(this.property);
        this.object.bind('change:' + this.property, this.update);
      }
      if (!this.indices) {
        throw 'No indices provided; or, object property not present';
      }
      this.options = options;
      delete this.options.parent;
      delete this.options.object;
      delete this.options.property;
      delete this.options.indices;
      this._bind();
      this._reset();
      this.initialize(this.options);
    }
    IndexedSubset.prototype.update = function() {
      if (this.object) {
        this.indices = this.object.get(this.property);
      }
      this._reset();
      this.trigger('reset', this);
      return this;
    };
    IndexedSubset.prototype._models = function() {
      var that;
      that = this;
      return _.filter(this.parent.models, function(obj) {
        var _ref;
        return _ref = obj.id, __indexOf.call(that.indices, _ref) >= 0;
      });
    };
    return IndexedSubset;
  })();
  _.supplement(Backbrace.IndexedSubset.prototype, Backbrace.Subset.prototype);
  window.Backbrace.Tableview = (function() {
    __extends(Tableview, Backbone.View);
    function Tableview() {
      Tableview.__super__.constructor.apply(this, arguments);
    }
    Tableview.prototype.collection = null;
    Tableview.prototype.table_options = null;
    Tableview.prototype.datatable = null;
    Tableview.prototype.initialize = function(options) {
      this.autoBind();
      this.el = $(this.el);
      this.table_options = options.table_options;
      this._table_rows = {};
      this.collection.bind('add', this._addItem);
      this.collection.bind('remove', this._removeItem);
      this.collection.bind('reset', this.repopulate);
      return this.collection.bind('change', this._updateItem);
    };
    Tableview.prototype.render = function() {
      this.datatable = this.el.dataTable(this.table_options);
      this.repopulate();
      return this;
    };
    Tableview.prototype.repopulate = function() {
      this.datatable.fnClearTable();
      return this.collection.each(this._addItem);
    };
    Tableview.prototype._addItem = function(model) {
      var row;
      row = this.datatable.fnAddData(model.toJSON())[0];
      return this._table_rows[model.id] = row;
    };
    Tableview.prototype._removeItem = function(model) {
      var row;
      row = this._table_rows[model.id];
      if (!(row != null)) {
        return;
      }
      return this.datatable.fnDeleteRow(row);
    };
    Tableview.prototype._updateItem = function(model) {
      var row;
      row = this._table_rows[model.id];
      if (!(row != null)) {
        return;
      }
      this.datatable.fnUpdate(model.toJSON(), row);
      return this.trigger('rowchange', row, model.id, this.datatable.fnGetNodes(row));
    };
    return Tableview;
  })();
  window.Backbrace.ListView = (function() {
    __extends(ListView, Backbone.View);
    function ListView() {
      ListView.__super__.constructor.apply(this, arguments);
    }
    ListView.prototype.collection = null;
    ListView.prototype.itemView = null;
    ListView.prototype.filter = null;
    ListView.prototype.initialize = function(options) {
      var _ref;
      this.autoBind();
      this.el = $(this.el);
      this.itemView = options.itemView;
      this.filter = (_ref = options.filter) != null ? _ref : function(model) {
        return true;
      };
      if (!(typeof this.filter === 'function')) {
        throw 'filter: Must be function';
      }
      if (!this.collection) {
        throw 'collection: Must be Backbone.Collection';
      }
      this.collection = options.collection;
      this.collection.bind('add', this.onCollectionAdd);
      this.collection.bind('reset', this.onCollectionReset);
      return this.collection.bind('change', this.onCollectionChange);
    };
    ListView.prototype.onCollectionAdd = function(model) {
      return this.render();
    };
    ListView.prototype.onCollectionReset = function() {
      return this.render();
    };
    ListView.prototype.onCollectionChange = function() {
      return this.render();
    };
    ListView.prototype.render = function() {
      this.el.children(".bb-list-item").remove();
      _.each(this.collection.filter(this.filter), this._addItem);
      return this;
    };
    ListView.prototype._addItem = function(model) {
      model.view = new this.itemView({
        model: model
      });
      return this.el.append($(model.view.render().el).addClass("bb-list-item"));
    };
    return ListView;
  })();
  window.Backbrace.TabPaneView = (function() {
    __extends(TabPaneView, Backbone.View);
    function TabPaneView() {
      TabPaneView.__super__.constructor.apply(this, arguments);
    }
    TabPaneView.prototype.initialize = function(options) {
      this.autoBind();
      this.el = $('#tabpane');
      this.views = options.views;
      if (options.defaultView != null) {
        return this.activeView = new this.views[options.defaultView]({
          el: this.el
        });
      }
    };
    TabPaneView.prototype.onTabChange = function(tabid) {
      this.activeView = new this.views[tabid]({
        el: this.el
      });
      return this.render();
    };
    TabPaneView.prototype.render = function() {
      var _ref;
      this.el.empty();
      if ((_ref = this.activeView) != null) {
        _ref.render();
      }
      return this;
    };
    return TabPaneView;
  })();
  window.Backbrace.TabBarView = (function() {
    __extends(TabBarView, Backbone.View);
    function TabBarView() {
      TabBarView.__super__.constructor.apply(this, arguments);
    }
    TabBarView.prototype.initialize = function() {
      var el, _i, _len, _ref;
      this.autoBind();
      this._wrapElement();
      this.tabs = {};
      _ref = this.el.children('li');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        this.tabs[el.id] = $(el);
      }
      this.activeTab = this.el.children('li').first().attr('id');
      return this.update();
    };
    TabBarView.prototype._wrapElement = function() {
      var that;
      that = this;
      this.el = $('.tabs').addClass('ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all');
      this.el.children('li').addClass('ui-state-default ui-corner-top');
      this.el.wrap('<div class="ui-tabs ui-widget" />');
      return this.el.children('li').each(function(i, el) {
        $(el).html('<a>' + $(el).text() + '</a>');
        return $(el).children('a').bind('click', function() {
          return that.setTab(el.id);
        });
      });
    };
    TabBarView.prototype.update = function() {
      this.el.children('li').removeClass('ui-tabs-selected ui-state-active');
      return this.tabs[this.activeTab].addClass('ui-tabs-selected ui-state-active');
    };
    TabBarView.prototype.setTab = function(tabid) {
      if (this.tabs[tabid] != null) {
        this.activeTab = tabid;
        this.update();
        return this.trigger('tabchange', tabid);
      }
    };
    TabBarView.prototype.getTab = function() {
      return this.activeTab;
    };
    return TabBarView;
  })();
  window.Backbrace.buildTabRouter = function(tabBarView, tabPaneView) {
    var ext, router, set_tab, tabid, tabview, _ref;
    ext = {
      routes: {}
    };
    _ref = tabPaneView.views;
    for (tabid in _ref) {
      tabview = _ref[tabid];
      ext.routes[tabid] = '_tab_' + tabid;
      set_tab = function(_tabid) {
        return function() {
          return tabBarView.setTab(_tabid);
        };
      };
      ext['_tab_' + tabid] = set_tab(tabid);
    }
    router = new (Backbone.Router.extend(ext));
    return router;
  };
}).call(this);
