define(["eh_plugin/static/amd/hooks", "eh_underscore/static/amd/underscore"], function (hooks, _) {
  return {
    create: function (hook_name, args, cb) {
      console.log("Testapp loaded");
      cb();
    }
  }
});
