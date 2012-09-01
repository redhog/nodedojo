define(["eh_plugin/static/amd/hooks", "eh_underscore/static/amd/underscore", "net", "repl"], function (hooks, _, net, repl) {
  var server;
  var serverName;
  var replservermod = {};

  var settings = {ip: "127.0.0.1", port: 4712};

  replservermod.create = function (hook_name, args, cb) {
    serverName = "Node " + process.versions.node;
    replservermod.restart("restart", {}, function () {
      console.log("You can access your node instance at telnet://" + settings.ip + ":" + settings.port + "/");
      cb();
    });
  }

  replservermod.restart = function (hook_name, args, cb) {
    if (server) {
      console.log("Restarting replserver server");
      server.close();
    }

    server = net.createServer(function (socket) {
      repl.start("> ", socket);
    });
    server.listen(settings.port, settings.host);

    cb();
  }

  return replservermod;
});
