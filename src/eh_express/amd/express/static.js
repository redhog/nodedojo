define(["path", "fs", "eh_plugin/static/amd/plugins", "eh_plugin/static/amd/hooks", "eh_underscore/static/amd/underscore"], function (path, fs, plugins, hooks, _) {
  // var CachingMiddleware = require('../../utils/caching_middleware');
  return {
    expressCreateServer: function (hook_name, args, cb) {
      // Cache both minified and static.
      /*
      var assetCache = new CachingMiddleware;
      args.app.all('/static/*', assetCache.handle);
      */

      args.app.all('/', function (req, res, next) {
        res.sendfile('static/index.html');
      });

      args.app.all('/static/require.js', function (req, res, next) {
        res.sendfile('node_modules/requirejs/require.js');
      });

      // serve plugin definitions
      // not very static, but served here so that client can do require("eh_plugins/static/plugin-definitions.json");
      args.app.get('/static/eh_plugins/static/plugin-definitions.json', function (req, res, next) {
        var clientParts = _(plugins.parts)
          .filter(function(part) { return _(part).has('client_hooks') });

        var clientPlugins = {};

        _(clientParts).chain()
          .map(function(part){ return part.plugin })
          .uniq()
          .each(function(name){
            clientPlugins[name] = _(plugins.plugins[name]).clone();
            delete clientPlugins[name]['package'];
          });

        res.header("Content-Type","application/json; charset=utf-8");
        res.write(JSON.stringify({"plugins": clientPlugins, "parts": clientParts}));
        res.end();
      });

      args.app.all('/static/:pluginname/static/:filename(*)', function (req, res, next) {
        if (!plugins.plugins[req.params.pluginname]) {
          console.error("Unable to find " + req.params.pluginname + " in (" + _.keys(plugins.plugins).join(", "))
          return;
        }

        res.sendfile(
          path.normalize(
            path.join(
              plugins.plugins[req.params.pluginname].package.path,
              'static',
              req.params.filename)));
      });


      args.app.all('/static/:filename(*)', function (req, res, next) {
        res.sendfile(
          path.normalize(
            path.join(
              'static',
              req.params.filename)));
      });

      return cb();
    }
  };
});
