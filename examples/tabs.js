(function() {
  var FirstTabView, SecondTabView, TabWithButton, ThirdTabView;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  FirstTabView = (function() {
    __extends(FirstTabView, Backbone.View);
    function FirstTabView() {
      FirstTabView.__super__.constructor.apply(this, arguments);
    }
    FirstTabView.prototype.initialize = function() {};
    FirstTabView.prototype.render = function() {
      $(this.el).text('First tab...');
      return this;
    };
    return FirstTabView;
  })();
  SecondTabView = (function() {
    __extends(SecondTabView, Backbone.View);
    function SecondTabView() {
      SecondTabView.__super__.constructor.apply(this, arguments);
    }
    SecondTabView.prototype.initialize = function() {};
    SecondTabView.prototype.render = function() {
      $(this.el).text('Second tab...');
      return this;
    };
    return SecondTabView;
  })();
  ThirdTabView = (function() {
    __extends(ThirdTabView, Backbone.View);
    function ThirdTabView() {
      ThirdTabView.__super__.constructor.apply(this, arguments);
    }
    ThirdTabView.prototype.initialize = function() {};
    ThirdTabView.prototype.render = function() {
      $(this.el).text('Third tab...');
      return this;
    };
    return ThirdTabView;
  })();
  TabWithButton = (function() {
    __extends(TabWithButton, Backbone.View);
    function TabWithButton() {
      TabWithButton.__super__.constructor.apply(this, arguments);
    }
    TabWithButton.prototype.events = {
      "click button": "alert"
    };
    TabWithButton.prototype.initialize = function() {};
    TabWithButton.prototype.render = function() {
      $(this.el).empty().html('<button> click me! </button>');
      return this;
    };
    TabWithButton.prototype.alert = function() {
      return alert("I was clicked!");
    };
    return TabWithButton;
  })();
  window.init = function() {
    var tabBarView, tabPaneView, tabRouter;
    tabBarView = new Backbrace.TabBarView({
      el: $('#tab-bar')
    });
    tabPaneView = new Backbrace.TabPaneView({
      el: $('#tab-pane'),
      defaultView: 'first',
      views: {
        first: FirstTabView,
        second: SecondTabView,
        third: ThirdTabView,
        fourth: TabWithButton
      }
    });
    tabRouter = Backbrace.buildTabRouter(tabBarView, tabPaneView);
    tabBarView.bind('tabchange', function(tabid) {
      tabPaneView.onTabChange(tabid);
      return tabRouter.navigate(tabid);
    });
    tabBarView.render();
    tabPaneView.render();
    return Backbone.history.start();
  };
  $(function() {
    return init();
  });
}).call(this);
