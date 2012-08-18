define(["express", "log4js", "eh_plugin/static/amd/hooks"], function (express, log4js, hooks) {
  var webaccessmod = {};

  webaccessmod.randomString = function (len) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var randomstring = '';
    len = len || 20
    for (var i = 0; i < len; i++)
    {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
  }


  webaccessmod.secret = null;

  //checks for basic http auth
  webaccessmod.basicAuth = function (req, res, next) {
    var hookResultMangle = function (cb) {
      return function (err, data) {
        return cb(!err && data.length && data[0]);
      }
    }

    var authorize = function (cb) {
      // Do not require auth for static paths...this could be a bit brittle
      if (req.path.match(/^\/static/)) return cb(true);
      if (req.session && req.session.user && req.session.user.is_admin) return cb(true);
      hooks.aCallFirst("authorize", {req: req, res:res, next:next, resource: req.path}, hookResultMangle(cb));
    }

    var authenticate = function (cb) {
      // If auth headers are present use them to authenticate...
      if (req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
        var userpass = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString().split(":")
        return hooks.aCallFirst("authenticate", {req: req, res:res, next:next, username: userpass[0], password: userpass[1]}, hookResultMangle(cb));
      }
      hooks.aCallFirst("authenticate", {req: req, res:res, next:next}, hookResultMangle(cb));
    }

    /* Authentication OR authorization failed. */
    var failure = function () {
      return hooks.aCallFirst("authFailure", {req: req, res:res, next:next}, hookResultMangle(function (ok) {
      if (ok) return;
        /* No plugin handler for invalid auth. Return Auth required
         * Headers, delayed for 1 second, if authentication failed
         * before. */
        res.header('WWW-Authenticate', 'Basic realm="Protected Area"');
        if (req.headers.authorization) {
          setTimeout(function () {
            res.send('Authentication required', 401);
          }, 1000);
        } else {
          res.send('Authentication required', 401);
        }
      }));
    }

    /* This is the actual authentication/authorization hoop. It is done in four steps:

       1) Try to just access the thing
       2) If not allowed using whatever creds are in the current session already, try to authenticate
       3) If authentication using already supplied credentials succeeds, try to access the thing again
       4) If all els fails, give the user a 401 to request new credentials

       Note that the process could stop already in step 3 with a redirect to login page.

    */
    authorize(function (ok) {
      if (ok) return next();
      authenticate(function (ok) {
        if (!ok) return failure();
        authorize(function (ok) {
          if (ok) return next();
          failure();
        });
      });
    });
  }

  webaccessmod.expressConfigure = function (hook_name, args, cb) {
    args.app.use(log4js.connectLogger(log4js.getLogger("http"), { level: log4js.levels.INFO, format: ':status, :method :url'}));
    args.app.use(express.cookieParser());

    /* Do not let express create the session, so that we can retain a
     * reference to it for socket.io to use. Also, set the key (cookie
     * name) to a javascript identifier compatible string. Makes code
     * handling it cleaner :) */
    if (!webaccessmod.sessionStore) {
      webaccessmod.sessionStore = new express.session.MemoryStore();
      webaccessmod.secret = webaccessmod.randomString(32);
    }

    args.app.sessionStore = webaccessmod.sessionStore;
    args.app.use(express.session({store: args.app.sessionStore,
                                  key: 'express_sid',
                                  secret: webaccessmod.secret}));

    args.app.use(webaccessmod.basicAuth);
    return cb();
  }

  return webaccessmod;
});
