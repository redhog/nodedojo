dojoConfig = {
  isDebug: true
};

require({
  baseUrl: 'js/',
  // set the paths to our library packages
  packages: [
    {
      name: 'dojo',
      location: 'lib/dojo',
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
      main: 'lib/main',
      lib: '.'
    }
  ],
  // set the path for the require plugins—text, i18n, etc.
  paths: {
    require: '../node_modules/requirejs/require'
  }
});

require(["jsdom"], function (jsdom) {
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
 
  require(["dojo"], function (dojo) {
    dojo.isBrowser = false;
    dojo.locale = navigator.language;

    require(['my/app']);
  });
});
