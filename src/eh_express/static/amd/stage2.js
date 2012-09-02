// requires dojo and our i18n dictionary
define(["require", 'eh_plugin/static/amd/plugins', 'eh_plugin/static/amd/hooks', "eh_async/static/amd/async", "eh_underscore/static/amd/underscore"], function (r, plugins, hooks, async, _) {
  async.series([
    plugins.update,
    function (cb) { hooks.aCallAll("create", {}, cb); },
    function (cb) {
      async.series(
        [
          plugins.formatPlugins,
          plugins.formatParts,
          plugins.formatHooks
        ],
        function (err, results) {
          console.log("Plugins:\n" + results[0]);
          console.log("\n\nParts:\n" + results[1]);
          console.log("\n\nHooks:\n" + results[2]);
          return cb();
        }
      );
    }
  ]);
  return;
});
