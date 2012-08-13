define([], function (plugins, async, _) {
    return {
        bar: function (hook_name, args, cb) {
            console.log("SUCCESS");
            return cb();
        }
    };
});
