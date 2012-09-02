define([ 'eh_plugin/static/amd/plugins', "eh_async/static/amd/async"], function (plugins, async) {
  return {
    commands: function (hook_name, args, cb) {
      return cb([
        {
          name: "plugins",
          description: "list installed plugins"
        },
        {
          name: "server",
          description: "run the server"
        }
      ]);
    },
    commands_plugins: function (hook_name, args, cb) {
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
  };
});
