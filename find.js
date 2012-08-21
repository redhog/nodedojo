define(["require"], function (require) {
  return {
    load: function (name, parentRequire, load, config) {
      load(name, name);
    }
  };
});
