// requires dojo and our i18n dictionary
define(['dojo', 'dojo/i18n!./nls/app', 'eh_plugin/static/amd/plugins', 'eh_plugin/static/amd/hooks', "eh_plugin/static/amd/async"], function (dojo, i18n, plugins, hooks, async) {

    async.series(
      [
        plugins.update,
        plugins.formatPlugins,
        plugins.formatParts,
        plugins.formatHooks
      ],
      function (err, results) {
        console.log("Plugins:\n" + results[1]);
        console.log("\n\nParts:\n" + results[2]);
        console.log("\n\nHooks:\n" + results[3]);
        hooks.callAll("foo", {});
      }
    );
    return;


  var isBrowser = dojo.isBrowser,
    mode = isBrowser ? 'Client' : 'Server',

    // our main application object; anything else that
    // requires 'my/app' in the future will receive this
    // object (because it’s returned at the end of this
    // function); all other defined modules work the
    // same way: the callback is invoked once and
    // the returned value is cached by RequireJS
    app = {
      onReady: function () {
        console.log(i18n.helloWorld);
      }
    };

  // loads either Client or Server class for Db and
  // Conduit depending upon if we are on the
  // client or server
  require(['my/db/' + mode, 'my/conduit/' + mode,
    'my/Baz'], function (Db, Conduit, Baz) {

    app.db = new Db();
    app.conduit = new Conduit();

    // this module works exactly the same on
    // both client and server, no extra code
    // necessary! NICE!
    app.baz = new Baz();

    // app has loaded, fire anything that has
    // connected to app.onReady!
    app.onReady();
  });

  return app;
});
