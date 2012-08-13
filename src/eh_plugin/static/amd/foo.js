define([], function () {
    return {
        bar: function (hook_name, args, cb) {
            console.log("SUCCESS");
            return cb();
        }
    };
});
