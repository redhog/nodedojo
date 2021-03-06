define(["log4js", "connect", "socket.io", "eh_plugin/static/amd/hooks"], function (log4js, connect, socketio, hooks) {
  return {
    expressCreateServer: function (hook_name, args, cb) {
      //init socket.io and redirect all requests to the MessageHandler
      var io = socketio.listen(args.app);

      /* Require an express session cookie to be present, and load the
       * session. See http://www.danielbaulig.de/socket-ioexpress for more
       * info */
      io.set('authorization', function (data, accept) {
        if (!data.headers.cookie) return accept('No session cookie transmitted.', false);
        data.cookie = connect.utils.parseCookie(data.headers.cookie);
        data.sessionID = data.cookie.express_sid;
        args.app.sessionStore.get(data.sessionID, function (err, session) {
          if (err || !session) return accept('Bad session / session has expired', false);
          data.session = new connect.middleware.session.Session(data, session);
          accept(null, true);
        });
      });


      //this is only a workaround to ensure it works with all browers behind a proxy
      //we should remove this when the new socket.io version is more stable
      io.set('transports', ['xhr-polling']);

      var socketIOLogger = log4js.getLogger("socket.io");
      io.set('logger', {
        debug: function (str) {
          socketIOLogger.debug.apply(socketIOLogger, arguments);
        }, 
        info: function (str) {
          socketIOLogger.info.apply(socketIOLogger, arguments);
        },
        warn: function (str) {
          socketIOLogger.warn.apply(socketIOLogger, arguments);
        },
        error: function (str) {
          socketIOLogger.error.apply(socketIOLogger, arguments);
        },
      });

      //minify socket.io javascript
      if(true)
        io.enable('browser client minification');

      hooks.aCallAll("socketio", {"app": args.app, "io": io}, cb);
    }
  };
});
