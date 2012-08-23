define(["eh_plugin/static/amd/hooks", "eh_underscore/static/amd/underscore"], function (hooks, _) {
  return {
    create: function (hook_name, args, cb) {
      dojoConfig = {
        isDebug: true
      };

      require(["eh_dojo/static/amd/dojo/main"], function (dojo) {
        dojo.isBrowser = true;
        dojo.locale = navigator.language;

        console.log("Testapp loaded");
        cb();
      });
    }
  }
});
