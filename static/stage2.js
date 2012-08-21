// requires dojo and our i18n dictionary
define(["require", 'eh_plugin/static/amd/plugins', 'eh_plugin/static/amd/hooks', "eh_async/static/amd/async"], function (r, plugins, hooks, async) {
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
      hooks.callAll("createServer", {});
    }
  );
  return;
});
