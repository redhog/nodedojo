define(["os"], function (os) {
  var errorhandlingmod = {};

  errorhandlingmod.onShutdown = false;
  errorhandlingmod.gracefulShutdown = function(err) {
    if(err && err.stack) {
      console.error(err.stack);
    } else if(err) {
      console.error(err);
    }

    //ensure there is only one graceful shutdown running
    if(errorhandlingmod.onShutdown) return;
    errorhandlingmod.onShutdown = true;

    console.log("graceful shutdown...");

    //stop the http server
    errorhandlingmod.app.close();

    setTimeout(function(){
      process.exit(1);
    }, 3000);
  }


  errorhandlingmod.expressCreateServer = function (hook_name, args, cb) {
    errorhandlingmod.app = args.app;

    args.app.error(function(err, req, res, next){
      res.send(500);
      console.error(err.stack ? err.stack : err.toString());
      errorhandlingmod.gracefulShutdown();
    });

    //connect graceful shutdown with sigint and uncaughtexception
    if(os.type().indexOf("Windows") == -1) {
      //sigint is so far not working on windows
      //https://github.com/joyent/node/issues/1553
      process.on('SIGINT', errorhandlingmod.gracefulShutdown);
    }

    process.on('uncaughtException', errorhandlingmod.gracefulShutdown);

    return cb();
  }
  return errorhandlingmod;
});
