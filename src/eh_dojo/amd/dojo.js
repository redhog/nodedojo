define(["require", "child_process", "path", "find!."], function (require, child_process, path, cwd) {
  return {
    init: function (hook_name, args, cb) {
      console.log("Downloading Dojo");
      var build = path.join(cwd, "../build.sh")
      child_process.spawn(build, [build], {customFds: [0, 1, 2]}).on('exit', function (code, signal) {
        console.log("Done downloading Dojo");
        cb();
      });
    },
    createServer: function (hook_name, args, cb) {
       dojoConfig = {
         isDebug: true
       };

      require(["eh_dojo/static/amd/dojo"], function (dojo) {
         dojo.isBrowser = false;
         dojo.locale = navigator.language;

         cb();
       });
    }
  };
});
