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
    // set the paths to our library packages
    packages: [
      {
        name: 'dojo',
        location: 'static/lib/dojo',
        // these are loaded from js/lib/dojo/lib.
        // lib/main-commonjs is the alternative package
        // main module from ticket #12357;
        // you must place it there yourself (it does not
        // come with dojo yet)
        main: typeof window !== "undefined" ?
          'main' :
          '../main-commonjs',
        lib: '.'
      },
      {
        name: 'dijit',
        location: 'lib/dijit',
        main: 'static/lib/main',
        lib: '.'
      }
    ],
    // set the path for the require plugins—text, i18n, etc.
    paths: { require: 'node_modules/requirejs/require'},
  });

  jsdom = jsdom.jsdom;
  document = jsdom("<html><head></head><body>hello world</body></html>"),
  window   = document.createWindow();
  navigator = {
      appCodeName: "NodeJS",
      appName: "NodeJS",
      appVersion: process.versions.node,
      cookieEnabled: true,
      geolocation: {},
      language: "en-US",
      mimeTypes: [],
      onLine: true,
      platform: "Linux i686",
      plugins: [],
      product: "NodeJS",
      productSub: "20030107",
      userAgent: process.versions.node,
      vendor: "Google Inc.",
      vendorSub: ""};
  screen = {};
  innerWidth = window.innerWidth;

  dojoConfig = {
    isDebug: true
  };

  require(["dojo"], function (dojo) {
    dojo.isBrowser = false;
    dojo.locale = navigator.language;

    require(['static/my/app']);
  });
});