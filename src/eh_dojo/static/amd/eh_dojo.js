dojoConfig = {
  isDebug: true
};

require.config({
  packages: [
    {name: "dojo", location: 'eh_dojo/static/amd/dojo', main:'main'},
    {name: "dijit", location: 'eh_dojo/static/amd/dijit', main:'main'},
    {name: "dojox", location: 'eh_dojo/static/amd/dojox', main:'main'}
  ]
});

define(["eh_plugin/static/amd/hooks", "eh_jquery/static/amd/jquery", "eh_underscore/static/amd/underscore", "dojo"], function (hooks, $, _, dojo) {
  return {
    create: function (hook_name, args, cb) {

      dojo.isBrowser = true;
      dojo.locale = navigator.language;

      $("body").addClass("claro");
      $("<div id='ui'></div>").appendTo("body");
      $("<link rel='stylesheet' href='/static/eh_dojo/static/amd/dijit/themes/claro/claro.css' type='text/css' />").appendTo("head");


      cb();
    }
  };
});
