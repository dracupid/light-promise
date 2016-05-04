MyPromise = require('../dist/light-promise')
assert = require('assert')

module.exports = {
  resolved: MyPromise.resolve.bind(MyPromise),
  rejected: MyPromise.reject.bind(MyPromise),
  deferred: function () {
    var defer;
    defer = {};
    defer.promise = new MyPromise(function (resolve, reject) {
      defer.resolve = resolve;
      return defer.reject = reject;
    });
    return defer;
  },
  defineGlobalPromise: function (global) {
    global.Promise = MyPromise
    global.assert = assert
  },

  removeGlobalPromise: function (global) {
    delete global.Promise;
  }
}