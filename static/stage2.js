// requires dojo and our i18n dictionary
define(["require", 'eh_plugin/static/amd/plugins', 'eh_plugin/static/amd/hooks', "eh_async/static/amd/async", "commander", "eh_underscore/static/amd/underscore"], function (r, plugins, hooks, async, commander, _) {
  plugins.update(
    function (err) {
      commander.version('0.0.1')
      commander.command('plugins')
        .description('list installed plugins')
        .action(function(){
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
             });
        });
      commander.command('server')
        .description('run the server')
        .action(function(){
          hooks.aCallAll("create", {}, function () {});
        });
      hooks.aCallAll("commanderSetup", {commander:commander}, function () {
        // Remove one item from argv since we have r.js in there, and it confuses commander...
        commander.parse(_.rest(process.argv, 1));
      });
    }
  );
  return;
});
