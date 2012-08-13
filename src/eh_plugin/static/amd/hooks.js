define(["./plugins", "./async", "eh_underscore/static/amd/underscore"], function (plugins, async, _) {
  var hooks = {};

  hooks.bubbleExceptions = true

  var hookCallWrapper = function (hook, hook_name, args, cb) {
    if (cb === undefined) cb = function (x) { return x; };

    // Normalize output to list for both sync and async cases
    var normalize = function(x) {
      if (x == undefined) return [];
      return x;
    }
    var normalizedhook = function () {
      return normalize(hook.hook_fn(hook_name, args, function (x) {
        return cb(normalize(x));
      }));
    }

    if (hooks.bubbleExceptions) {
        return normalizedhook();
    } else {
      try {
        return normalizedhook();
      } catch (ex) {
        console.error([hook_name, hook.part.full_name, ex.stack || ex]);
      }
    }
  }

  hooks.syncMapFirst = function (lst, fn) {
    var i;
    var result;
    for (i = 0; i < lst.length; i++) {
      result = fn(lst[i])
      if (result.length) return result;
    }
    return undefined;
  }

  hooks.mapFirst = function (lst, fn, cb) {
    var i = 0;

    next = function () {
      if (i >= lst.length) return cb(undefined);
      fn(lst[i++], function (err, result) {
        if (err) return cb(err);
        if (result.length) return cb(null, result);
        next();
      });
    }
    next();
  }


  /* Don't use Array.concat as it flatterns arrays within the array */
  hooks.flatten = function (lst) {
    var res = [];
    if (lst != undefined && lst != null) {
      for (var i = 0; i < lst.length; i++) {
        if (lst[i] != undefined && lst[i] != null) {
          for (var j = 0; j < lst[i].length; j++) {
            res.push(lst[i][j]);
          }
        }
      }
    }
    return res;
  }

  hooks.callAll = function (hook_name, args) {
    if (!args) args = {};
    if (plugins.hooks[hook_name] === undefined) return [];
    return _.flatten(_.map(plugins.hooks[hook_name], function (hook) {
      return hookCallWrapper(hook, hook_name, args);
    }), true);
  }

  hooks.aCallAll = function (hook_name, args, cb) {
    if (!args) args = {};
    if (!cb) cb = function () {};
    if (plugins.hooks[hook_name] === undefined) return cb(null, []);
    async.map(
      plugins.hooks[hook_name],
      function (hook, cb) {
        hookCallWrapper(hook, hook_name, args, function (res) { cb(null, res); });
      },
      function (err, res) {
          cb(null, _.flatten(res, true));
      }
    );
  }

  hooks.callFirst = function (hook_name, args) {
    if (!args) args = {};
    if (plugins.hooks[hook_name] === undefined) return [];
    return hooks.syncMapFirst(plugins.hooks[hook_name], function (hook) {
      return hookCallWrapper(hook, hook_name, args);
    });
  }

  hooks.aCallFirst = function (hook_name, args, cb) {
    if (!args) args = {};
    if (!cb) cb = function () {};
    if (plugins.hooks[hook_name] === undefined) return cb(null, []);
    hooks.mapFirst(
      plugins.hooks[hook_name],
      function (hook, cb) {
        hookCallWrapper(hook, hook_name, args, function (res) { cb(null, res); });
      },
      cb
    );
  }

  hooks.callAllStr = function(hook_name, args, sep, pre, post) {
    if (sep == undefined) sep = '';
    if (pre == undefined) pre = '';
    if (post == undefined) post = '';
    var newCallhooks = [];
    var callhooks = hooks.callAll(hook_name, args);
    for (var i = 0, ii = callhooks.length; i < ii; i++) {
      newCallhooks[i] = pre + callhooks[i] + post;
    }
    return newCallhooks.join(sep || "");
  }

  return hooks;
});
