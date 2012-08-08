require(["path", "jsdom", "resolve", "node-proxy"], function (path, jsdom, resolve, Proxy) {
  var oldLoad = require.load;
  require.load = function (context, moduleName, url) {
    if (!context.npmamd) {
      context.npmamd = true;
      context.config.map = Proxy.create({get:function (proxy, parentModuleName) {
        return Proxy.create({get:function (proxy, moduleName) {
          var res;
          try {
            res = resolve.sync(
              moduleName,
              {
                paths : [],
                basedir : './' + path.dirname(parentModuleName),
                extensions : [ '.js' ],
              }
            );
            res = res.match(/\.\/(.*)\.[^.]*/)[1];
            if (res.indexOf('/amd/') == -1 && res.indexOf('node_modules') == 0) {
              res = res.match(/node_modules\/(.*)/)[1];
            }
          } catch (e) {
            res = moduleName;
          }

          // console.log( ["Y", parentModuleName, moduleName, res]);

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