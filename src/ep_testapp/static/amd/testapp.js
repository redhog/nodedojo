define(["eh_plugin/static/amd/hooks", "eh_jquery/static/amd/jquery", "eh_underscore/static/amd/underscore"], function (hooks, $, _) {
  testapp = {
    create: function (hook_name, args, cb) {
      require(["dojo",
               "dijit/layout/BorderContainer",
               "dijit/layout/ContentPane",
               "dijit/layout/AccordionContainer",
               "dijit/layout/TabContainer",
               "dojox/layout/TableContainer",
               "dijit/MenuBar",
               "dijit/MenuItem",
               "dijit/Menu",
               "dijit/PopupMenuBarItem",
               "dijit/_base/popup",
               "dojo/html",
              ], function (dojo) {
        console.log("Testapp loaded");

        testapp.Ui = dojo.declare([dijit.layout.BorderContainer], {
          design:'sidebar',
          style:'border: 0px; height: 100%; width: 100%;',
          gutters: false,
          startup: function () {
            this.inherited(arguments);

            var ui = this;

            ui.menu = new testapp.TopMenu({region: 'top'});
            ui.addChild(ui.menu);
            ui.output = new dijit.layout.ContentPane({region: 'center'});
            ui.addChild(ui.output);
          }
        });


        testapp.TopMenu = dojo.declare([dijit.MenuBar], {
          startup: function () {
            var menu = this;
            var item;
            var submenu;

            submenu = new testapp.ActionMenu({dataParent: menu});
            item = new dijit.PopupMenuBarItem({label:"Actions", popup: submenu});
            dojo.place(submenu.domNode, item.domNode);
            menu.addChild(item);

            item = new dijit.MenuBarItem({label:"Help"});
            menu.addChild(item);
            item.connect(item, 'onClick', function (e) { });

            this.inherited(arguments);
          }
        });

        testapp.ActionMenu = dojo.declare([dijit.Menu], {
          startup: function () {
            var menu = this;
            var item = new dijit.MenuBarItem({label:"Send some stuff to server"});
            menu.addChild(item);
            item.connect(item, 'onClick', function (e) {  });

            return this.inherited(arguments);
          }
        });

        dojo.addOnLoad(function() {
          ui = testapp.Ui({}, "ui");
          ui.startup();
          ui.resize();
        });

        cb();
      });
    }
  }
  return testapp;
});
