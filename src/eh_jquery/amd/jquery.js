define(["require", "child_process", "path", "find!."], function (require, child_process, path, cwd) {
  return {
    init: function (hook_name, args, cb) {
      console.log("Downloading jQuery");
      var build = path.join(cwd, "../build.sh")
      child_process.spawn(build, [build], {customFds: [0, 1, 2]}).on('exit', function (code, signal) {
        console.log("Done downloading jQuery");
        cb();
      });
    }
  };
});
