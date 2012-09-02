define(["require", "child_process", "path", "find!."], function (require, child_process, path, cwd) {
  var mod = {};
  mod.init = function (hook_name, args, cb) {
    console.log("Downloading jQuery");
    var build = path.join(cwd, "../build.sh")
    child_process.spawn(build, [build], {customFds: [0, 1, 2]}).on('exit', function (code, signal) {
      console.log("Done downloading jQuery");
      cb();
    });
  };

  mod.create = function (hook_name, args, cb) {
    require(["eh_persistencejs/static/amd/persistencejs/lib/persistence",
             "eh_persistencejs/static/amd/persistencejs/lib/persistence.store.sqlite3",
//             "eh_persistencejs/static/amd/persistencejs/lib/persistence.store.mysql",
//             "eh_persistencejs/static/amd/persistencejs/lib/persistence.store.memory"
            ], function (persistence, store) {
      store.config(persistence.persistence, "sqlite.db");
      mod.session = store.getSession();
      cb();
    });
  };

  mod.commands = function (hook_name, args, cb) {
    return cb([
      {
        name: "syncdb",
        description: "Sync models to database"
      }
    ]);
  };

  mod.commands_syncdb = function (hook_name, args, cb) {
    mod.session.schemaSync(function(tx) { 
      console.log("Schema synchronized");
      cb();
    });
  };

  return mod;
});
