define(["jsdom"], function (jsdom) {
  return {
    createServer: function (hook_name, args, cb) {
      document = jsdom.jsdom("<html><head></head><body>hello world</body></html>"),
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
      cb();
    }
  };
});
