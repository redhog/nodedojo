// requires dojo and our i18n dictionary
define(["require", 'eh_plugin/static/amd/plugins', 'eh_plugin/static/amd/hooks', "eh_async/static/amd/async", "commander", "eh_underscore/static/amd/underscore"], function (r, plugins, hooks, async, commander, _) {
  async.waterfall([
    plugins.update,
    function (cb) { hooks.aCallAll("create", {}, cb); },
    function (res, cb) { hooks.aCallAll("commands", {}, cb); },
    function (commandList, cb) {
      commander.version('0.0.1')
      var commandDict = {};
      _.each(commandList, function(command) {
        if (!commandDict[command.name]) {
          commandDict[command.name] = command;
        } else {
          _.defaults(commandDict[command.name].options, command.options);
        }
      });
      for (commandName in commandDict) {
        var command = commandDict[commandName];
        var commanderCommand = commander.command(command.name)
        commanderCommand.description(command.description || "");
        (function (command, commanderCommand) {
          commanderCommand.action(function () {
            hooks.aCallAll("commands_" + command.name, {command: commanderCommand});
          });
        })(command, commanderCommand);
        for (option in command.options || {}) {
          commanderCommand.option(
            command.options[option].spec,
            command.options[option].description,
            command.options[option].type
          );
        }
      }

      // Remove one item from argv since we have r.js in there, and it confuses commander...
      commander.parse(_.rest(process.argv, 1));
      cb();
    }
  ]);
  return;
});
