(function () {
  var isClient = typeof global != "object";

  var makeMod = function (_, async, jQuery, npm, readInstalled, relativize, readJson, path, fs, tsort, util) {
    var pluginsmod = {};

    pluginsmod.isClient = isClient;

    pluginsmod.prefix = 'ep_';
    pluginsmod.prefix_hidden = 'eh_';
    pluginsmod.loaded = false;
    pluginsmod.plugins = {};
    pluginsmod.parts = [];
    pluginsmod.hooks = {};
    pluginsmod.baseURL = '';

    pluginsmod.ensure = function (cb) {
      if (!pluginsmod.loaded)
        pluginsmod.update(cb);
      else
        cb();
    };

    pluginsmod.formatPlugins = function (cb) {
      cb(null, _.keys(pluginsmod.plugins).join(", "));
    };

    pluginsmod.formatParts = function (cb) {
      cb(null, _.map(pluginsmod.parts, function (part) { return part.full_name; }).join("\n"));
    };

      pluginsmod.formatHooks = function (cb, hook_set_name) {
      pluginsmod.extractHooks(pluginsmod.parts, hook_set_name || "hooks", function (err, hooks) {
        var res = [];
        _.chain(hooks).keys().forEach(function (hook_name) {
          _.forEach(hooks[hook_name], function (hook) {
            res.push("<dt>" + hook.hook_name + "</dt><dd>" + hook.hook_fn_name + " from " + hook.part.full_name + "</dd>");
          });
        });
        cb(null, "<dl>" + res.join("\n") + "</dl>");
      });
    };

    pluginsmod.loadFn = function (path, hookName, cb) {
      var functionName
        , parts = path.split(":");

      // on windows: C:\foo\bar:xyz
      if(parts[0].length == 1) {
        if(parts.length == 3)
          functionName = parts.pop();
        path = parts.join(":");
      }else{
        path = parts[0];
        functionName = parts[1];
      }
      functionName = functionName ? functionName : hookName;  

      require([path], function (fn) {
        // FIXME: Handle errors here
        _.each(functionName.split("."), function (name) {
          fn = fn[name];
        });
        cb(null, fn);
      });
    };

    pluginsmod.extractHooks = function (parts, hook_set_name, cb) {
      var hooks = [];
      _.each(parts,function (part) {
        _.chain(part[hook_set_name] || {})
        .keys()
        .each(function (hook_name) {
          var hook_fn_name = part[hook_set_name][hook_name];

          /* On the server side, you can't just
           * require("pluginname/whatever") if the plugin is installed as
           * a dependency of another plugin! Bah, pesky little details of
           * npm... */
          if (!pluginsmod.isClient) {
            hook_fn_name = path.normalize(
              path.relative(
                path.resolve("."),
                path.join(path.dirname(pluginsmod.plugins[part.plugin].package.path),
                  hook_fn_name)
              )
            );
          }
          hooks.push({"hook_name": hook_name, "hook_fn_name": hook_fn_name, "part": part});
        });
      });

      async.parallel(
        hooks.map(function (hook) {
          return function(cb) {
            pluginsmod.loadFn(hook.hook_fn_name, hook.hook_name, function (err, hook_fn) {
              if (err) {
                console.error("Failed to load '" + hook.hook_fn_name + "' for '" + hook.part.full_name + "/" + hook_set_name + "/" + hook.hook_name + "': " + err.toString());
                hook = undefined;
              } else {
                hook.hook_fn = hook_fn;
              }
              cb(null, hook);
            });
          }
        }),
        function (err, hooks) {
          // Filter out undefined ones, that is, ones that failed to
          // load, and make a mapping of hook_name -> list of hook
          // registrations
          var hookmap = {};
          _.each(hooks, function (hook) {
            if (!hook) return;
            if (hookmap[hook.hook_name] === undefined) hookmap[hook.hook_name] = [];
            hookmap[hook.hook_name].push(hook);
          });          
          cb(err, hookmap);
        }
      );
    };


    if (pluginsmod.isClient) {
      pluginsmod.update = function (cb) {
        // It appears that this response (see #620) may interrupt the current thread
        // of execution on Firefox. This schedules the response in the run-loop,
        // which appears to fix the issue.
        var callback = function () {setTimeout(cb, 0);};

        jQuery.getJSON(pluginsmod.baseURL + 'pluginfw/plugin-definitions.json', function(data) {
          pluginsmod.plugins = data.plugins;
          pluginsmod.parts = data.parts;
          pluginsmod.extractHooks(pluginsmod.parts, "client_hooks", function (err, hooks) {
            pluginsmod.hooks = hooks;
            pluginsmod.loaded = true;
            callback();
          });
         }).error(function(xhr, s, err){
           console.error("Failed to load plugin-definitions: " + err);
           callback();
         });
      };
    } else {

      pluginsmod.callInit = function (cb) {
        var hooks = require("./hooks");
        async.map(
          Object.keys(pluginsmod.plugins),
          function (plugin_name, cb) {
            var plugin = pluginsmod.plugins[plugin_name];
            fs.stat(path.normalize(path.join(plugin.package.path, ".ep_initialized")), function (err, stats) {
              if (err) {
                async.waterfall([
                  function (cb) { fs.writeFile(path.normalize(path.join(plugin.package.path, ".ep_initialized")), 'done', cb); },
                  function (cb) { hooks.aCallAll("init_" + plugin_name, {}, cb); },
                  cb,
                ]);
              } else {
                cb();
              }
            });
          },
          function () { cb(); }
        );
      }

      pluginsmod.update = function (cb) {
        pluginsmod.getPackages(function (er, packages) {
          var parts = [];
          var plugins = {};
          // Load plugin metadata ep.json
          async.forEach(
            Object.keys(packages),
            function (plugin_name, cb) {
              pluginsmod.loadPlugin(packages, plugin_name, plugins, parts, cb);
            },
            function (err) {
              if (err) cb(err);
              pluginsmod.plugins = plugins;
              pluginsmod.parts = pluginsmod.sortParts(parts);
              pluginsmod.extractHooks(pluginsmod.parts, "hooks", function (err, hooks) {
                pluginsmod.hooks = hooks;
                pluginsmod.loaded = true;
                pluginsmod.callInit(cb);
              });
            }
          );
        });
      };

      pluginsmod.getPackages = function (cb) {
        // Load list of installed NPM packages, flatten it to a list, and filter out only packages with names that
        var dir = path.resolve(npm.dir, '..');
        readInstalled(dir, function (er, data) {
          if (er) cb(er, null);
          var packages = {};
          function flatten(deps) {
            _.chain(deps).keys().each(function (name) {
              if (name.indexOf(pluginsmod.prefix) === 0 || name.indexOf(pluginsmod.prefix_hidden) === 0) {
                packages[name] = _.clone(deps[name]);
                // Delete anything that creates loops so that the plugin
                // list can be sent as JSON to the web client
                delete packages[name].dependencies;
                delete packages[name].parent;
              }

              if (deps[name].dependencies !== undefined) flatten(deps[name].dependencies);
            });
          }

          var tmp = {};
          tmp[data.name] = data;
          flatten(tmp);
          cb(null, packages);
        });
        };

        pluginsmod.loadPlugin = function (packages, plugin_name, plugins, parts, cb) {
        var plugin_path = path.resolve(packages[plugin_name].path, "ep.json");
        fs.readFile(
          plugin_path,
          function (er, data) {
            if (er) {
              console.error("Unable to load plugin definition file " + plugin_path);
              return cb();
            }
            try {
              var plugin = JSON.parse(data);
              plugin['package'] = packages[plugin_name];
              plugins[plugin_name] = plugin;
              _.each(plugin.parts, function (part) {
                part.plugin = plugin_name;
                part.full_name = plugin_name + "/" + part.name;
                parts[part.full_name] = part;
              });
            } catch (ex) {
              console.error("Unable to parse plugin definition file " + plugin_path + ": " + ex.toString());
            }
            cb();
          }
        );
        };

      pluginsmod.partsToParentChildList = function (parts) {
        var res = [];
        _.chain(parts).keys().forEach(function (name) {
          _.each(parts[name].post || [], function (child_name)  {
            res.push([name, child_name]);
          });
          _.each(parts[name].pre || [], function (parent_name)  {
            res.push([parent_name, name]);
          });
          if (!parts[name].pre && !parts[name].post) {
            res.push([name, ":" + name]); // Include apps with no dependency info
          }
        });
        return res;
      };


      // Used only in Node, so no need for _
      pluginsmod.sortParts = function(parts) {
        return tsort(
          pluginsmod.partsToParentChildList(parts)
        ).filter(
          function (name) { return parts[name] !== undefined; }
        ).map(
          function (name) { return parts[name]; }
        );
      };

    }

    return pluginsmod;
  };

  if (isClient) {
    define(["eh_underscore/static/amd/underscore", "./async", "./jquery"], function (_, async, jQuery) { return  makeMod(_, async, jQuery); });
  } else {
    define(
        ["eh_underscore/static/amd/underscore", "./async", "npm/lib/npm.js", "eh_plugin/read-installed.js", "npm/lib/utils/relativize.js", "npm/lib/utils/read-json.js", "path", "fs", "./tsort", "util"],
      function (_, async, npm, readInstalled, relativize, readJson, path, fs, tsort, util) {
        return makeMod(_, async, undefined, npm, readInstalled, relativize, readJson, path, fs, tsort, util);
      }
    );
  }

})();
