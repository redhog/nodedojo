define(["eh_plugin/static/amd/hooks", "eh_underscore/static/amd/underscore", "fs", "path", "express"], function (hooks, _, fs, path, express) {
  var server;
  var serverName;
  var expressmod = {};

  var settings = {ip: "127.0.0.1", port: 4711};

  expressmod.create = function (hook_name, args, cb) {
    serverName = "Node " + process.versions.node;
    expressmod.restart("restart", {}, function () {
      console.log("You can access your node instance at http://" + settings.ip + ":" + settings.port + "/");
      cb();
    });
  }

  expressmod.restart = function (hook_name, args, cb) {
    if (server) {
      console.log("Restarting express server");
      server.close();
    }

    server = express.createServer();

    server.use(function (req, res, next) {
      res.header("Server", serverName);
      next();
    });

    server.configure(function() {
      hooks.aCallAll("expressConfigure", {"app": server});
    });

    hooks.aCallAll("expressCreateServer", {app: server, settings:settings}, function () {
      server.listen(settings.port, settings.ip);
      cb();
    });
  }

  return expressmod;
});
