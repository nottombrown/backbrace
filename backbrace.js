(function() {
  var autoBind, subsetMethods;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
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
        throw 'Required option: filterfn must be function mapping Model to boolean.';
      }
      this.options = options;
      delete this.options.parent;
      delete this.options.filterfn;
      this._bindings = {};
      this.models = [];
      this._bind();
      this._reset();
      this.initialize(this.options);
    }
    Subset.prototype._bind = function() {
      this.parent.bind('all', __bind(function(ev, model) {
        switch (ev) {
          case 'add':
          case 'remove':
          case 'destroy':
            if (this.filterfn(model)) {
              this._reset();
              return this.trigger.apply(this, arguments);
            }
            break;
          case 'error':
            if (this.filterfn(model)) {
              return this.trigger.apply(this, arguments);
            }
            break;
          case 'reset':
            return this.update();
          default:
            if (ev.indexOf('change') === 0) {
              if (this.getByCid(model)) {
                if (!this.filterfn(model)) {
                  this._reset();
                  this.trigger('remove', model, this);
                } else {
                  this.trigger.apply(this, arguments);
                }
              }
              if (!this.getByCid(model) && this.filterfn(model)) {
                this._reset();
                return this.trigger('add', model, this);
              }
            }
        }
      }, this));
      return this._boundOnModelEvent = _.bind(this._onModelEvent, this);
    };
    Subset.prototype.initialize = function(options) {};
    Subset.prototype._reset = function() {
      this.model = this.parent.model;
      _.each(this.models, __bind(function(model) {
        return model.unbind('all', this._bindings[model.id]);
      }, this));
      this.models = this._models();
      _.each(this.models, __bind(function(model) {
        return this._bindings[model.id] = model.bind('all', __bind(function(ev) {
          return this._onModelEvent(model, ev, arguments);
        }, this));
      }, this));
      return this.length = this.models.length;
    };
    Subset.prototype._models = function() {
      return _.filter(this.parent.models, this.filterfn);
    };
    Subset.prototype._onModelEvent = function(model, ev, params) {
      switch (ev) {
        case 'add':
        case 'remove':
        case 'destroy':
        case 'reset':
        case 'error':
          return;
        default:
          if (ev.indexOf('change') === 0) {
            return;
          }
      }
      if (this.filterfn(model)) {
        return this.trigger.apply(this, params);
      }
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
    __extends(IndexedSubset, Backbrace.Subset);
    function IndexedSubset(options) {
      this.autoBind();
      this.parent = options != null ? options.parent : void 0;
      if (!(this.parent != null)) {
        throw 'Required option: parent';
      }
      this.object = options != null ? options.object : void 0;
      this.property = options != null ? options.property : void 0;
      if ((this.object != null) && (this.property != null)) {
        this.indices = this.object.get(this.property);
        if (!(this.indices != null)) {
          throw 'Object property is not present.';
        }
        this.object.bind('change:' + this.property, __bind(function() {
          this.indices = this.object.get(this.property);
          return this.update();
        }, this));
      } else {
        this.indices = options != null ? options.indices : void 0;
        if (!(this.indices != null)) {
          throw 'Required option: indices (if object, property not provided).';
        }
      }
      this._bind();
      this._reset();
    }
    IndexedSubset.prototype.filterfn = function(id) {
      return __indexOf.call(this.indices, id) >= 0;
    };
    IndexedSubset.prototype._models = function() {
      return this.parent.filter(__bind(function(obj) {
        var _ref;
        return _ref = obj.id, __indexOf.call(this.indices, _ref) >= 0;
      }, this));
    };
    return IndexedSubset;
  })();
  window.Backbrace.TableView = (function() {
    __extends(TableView, Backbone.View);
    function TableView() {
      TableView.__super__.constructor.apply(this, arguments);
    }
    TableView.prototype.collection = null;
    TableView.prototype.table_options = null;
    TableView.prototype.datatable = null;
    TableView.prototype.initialize = function(options) {
      this.autoBind();
      this.el = $(this.el);
      this.table_options = options.table_options;
      this._table_rows = {};
      this.collection.bind('add', this._addItem);
      this.collection.bind('remove', this._removeItem);
      this.collection.bind('reset', this.repopulate);
      return this.collection.bind('change', this._updateItem);
    };
    TableView.prototype.render = function() {
      this.datatable = this.el.dataTable(this.table_options);
      this.repopulate();
      return this;
    };
    TableView.prototype.repopulate = function() {
      this.datatable.fnClearTable();
      return this.collection.each(this._addItem);
    };
    TableView.prototype._addItem = function(model) {
      var row;
      row = this.datatable.fnAddData(model.toJSON())[0];
      return this._table_rows[model.id] = row;
    };
    TableView.prototype._removeItem = function(model) {
      var row;
      row = this._table_rows[model.id];
      if (!(row != null)) {
        return;
      }
      return this.datatable.fnDeleteRow(row);
    };
    TableView.prototype._updateItem = function(model) {
      var row;
      row = this._table_rows[model.id];
      if (!(row != null)) {
        return;
      }
      this.datatable.fnUpdate(model.toJSON(), row);
      return this.trigger('rowchange', row, model.id, this.datatable.fnGetNodes(row));
    };
    return TableView;
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
      this.el = $(this.el);
      this.views = options.views;
      if (options.defaultView != null) {
        return this.activeView = new this.views[options.defaultView]();
      }
    };
    TabPaneView.prototype.onTabChange = function(tabid) {
      this.activeView.remove();
      this.activeView = new this.views[tabid]();
      return this.render();
    };
    TabPaneView.prototype.render = function() {
      var _ref;
      this.el.append((_ref = this.activeView) != null ? _ref.render().el : void 0);
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
      this.el.addClass('ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all');
      this.el.children('li').addClass('ui-state-default ui-corner-top');
      this.el.wrap('<div class="ui-tabs ui-widget" />');
      return this.el.children('li').each(function(i, el) {
        $(el).html('<a>' + $(el).text() + '</a>');
        return $(el).children('a').click(function() {
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
    var ext, router, tabid, tabview, _fn, _ref;
    ext = {
      routes: {}
    };
    _ref = tabPaneView.views;
    _fn = function(tabid) {
      return ext['_tab_' + tabid] = function() {
        return tabBarView.setTab(tabid);
      };
    };
    for (tabid in _ref) {
      tabview = _ref[tabid];
      ext.routes[tabid] = '_tab_' + tabid;
      _fn(tabid);
    }
    router = new (Backbone.Router.extend(ext));
    return router;
  };
}).call(this);
