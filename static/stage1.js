require(["path", "jsdom", "resolve", "node-proxy"], function (path, jsdom, resolve, Proxy) {
  var oldLoad = require.load;
  require.load = function (context, moduleName, url) {
    if (!context.npmamd) {
      context.npmamd = true;
      context.config.map = Proxy.create({get:function (proxy, parentModuleName) {
        return Proxy.create({get:function (proxy, moduleName) {
          /* Rules for what we return:

             Paths starting with ./, ../, or / will be treated as AMD modules
             Paths ending with .js  will be treated as AMD modules
             Paths on the form foo/bar/fie will be treated as node modules
           */

          var res;
          var msg = "";
          try {
            res = resolve.sync(
              moduleName,
              {
                paths : [],
                basedir : './' + path.dirname(parentModuleName),
                extensions : [ '.js' ],
              }
            );
            if (res.indexOf("/") == 0) {
              res = path.relative(process.cwd(), res)
            }
            var noext = res.match(/\.\/(.*)\.[^.]*/);
            if (noext) {
              res = noext[1];
            }
            if (res.indexOf('/amd/') == -1 && res.indexOf('node_modules') == 0) {
              msg = "removed node_modules";
              res = res.match(/node_modules\/(.*)/)[1];
            }
          } catch (e) {
            msg = e;
            res = moduleName;
          }

//          console.log("require(" + parentModuleName + " -> " + moduleName + ") => " + res + " (" + msg + ")");

          return res;
        }});
      }});
    }
    return oldLoad(context, moduleName, url);
  };

  require({
    baseUrl: './',
    // set the path for the require plugins—text, i18n, etc.
    paths: { require: 'node_modules/requirejs/require'},
  });

  require(['./static/stage2.js'], function (stage2) {});
});