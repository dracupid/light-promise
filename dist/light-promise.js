
/*
    A Super Lightweight promise/A+ implementation
    @author: Draucpid
 */
var isFun,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

isFun = function(a) {
  return a && a.constructor.name === "Function";
};

(function(root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    return module.exports = factory(root);
  } else if (typeof define === 'function' && define.amd) {
    return define('light-promise', [], function() {
      return factory(root);
    });
  } else {
    if (!root.Promise) {
      return root.Promise = factory(root);
    }
  }
})(this, function(root) {
  var Promise, resolveX;
  resolveX = function(promise, x) {
    if (promise === x) {
      promise.reject(new TypeError());
    } else if (x instanceof Promise) {
      switch (x.state) {
        case 'pending':
          x.then(promise.resolve, promise.reject);
          break;
        case 'fulfilled':
          promise.resolve(x.value);
          break;
        case 'rejected':
          promise.reject(x.reason);
      }
    } else {
      promise.resolve(x);
    }
    return promise;
  };
  return Promise = (function() {
    function Promise(resolver) {
      this._fireReject = bind(this._fireReject, this);
      this._fireResolve = bind(this._fireResolve, this);
      this.reject = bind(this.reject, this);
      this.resolve = bind(this.resolve, this);
      this.state = 'pending';
      this.onFulfilled = [];
      this.onRejected = [];
      this.onFulfilled.num = this.onRejected.num = 0;
      this.resolved = this.rejected = false;
      setTimeout((function(_this) {
        return function() {
          var err;
          try {
            return resolver && resolver.call(null, _this.resolve, _this.reject);
          } catch (_error) {
            err = _error;
            return _this.reject(err);
          }
        };
      })(this), 0);
      this;
    }

    Promise.prototype.then = function(onFulfilled, onRejected) {
      var next;
      next = new Promise();
      if (isFun(onFulfilled)) {
        this.onFulfilled.num += 1;
        this.onFulfilled.push({
          fun: onFulfilled,
          next: next
        });
      } else {
        this.onFulfilled.push({
          fun: null,
          next: next
        });
      }
      if (isFun(onRejected)) {
        this.onRejected.num += 1;
        this.onRejected.push({
          fun: onRejected,
          next: next
        });
      } else {
        this.onRejected.push({
          fun: null,
          next: next
        });
      }
      switch (this.state) {
        case 'fulfilled':
          this._fireResolve();
          break;
        case 'rejected':
          this._fireReject();
      }
      return next;
    };

    Promise.prototype["catch"] = function(onRejected) {
      return this.then(null, onRejected);
    };

    Promise.prototype.resolve = function(value1) {
      this.value = value1;
      if (this.state === 'fulfilled') {
        return this;
      }
      this.state = 'fulfilled';
      this._fireResolve();
      return this;
    };

    Promise.prototype.reject = function(reason1) {
      this.reason = reason1;
      if (this.state === 'rejected') {
        return this;
      }
      this.state = 'rejected';
      this._fireReject();
      return this;
    };

    Promise.prototype._fireResolve = function() {
      return setTimeout((function(_this) {
        return function() {
          var _onFullfilled, e, ful, fun, j, k, len, len1, next, results, rs;
          next = null;
          _onFullfilled = [].concat(_this.onFulfilled);
          if (_this.onFulfilled.num) {
            _this.onFulfilled.length = 0;
            _this.onFulfilled.num = 0;
            for (j = 0, len = _onFullfilled.length; j < len; j++) {
              ful = _onFullfilled[j];
              next = ful.next;
              fun = ful.fun;
              if (!fun) {
                return;
              }
              try {
                rs = fun.call(void 0, _this.value);
                next && resolveX(next, rs);
              } catch (_error) {
                e = _error;
                next.reject(e);
              }
            }
            return _this.fulfilled = true;
          } else {
            _this.onFulfilled.length = 0;
            results = [];
            for (k = 0, len1 = _onFullfilled.length; k < len1; k++) {
              ful = _onFullfilled[k];
              results.push(ful.next.resolve(_this.value));
            }
            return results;
          }
        };
      })(this), 0);
    };

    Promise.prototype._fireReject = function() {
      return setTimeout((function(_this) {
        return function() {
          var _onRejected, e, fun, j, k, len, len1, next, rej, results, rs;
          next = null;
          _onRejected = [].concat(_this.onRejected);
          if (_this.onRejected.num) {
            _this.onRejected.length = 0;
            _this.onRejected.num = 0;
            for (j = 0, len = _onRejected.length; j < len; j++) {
              rej = _onRejected[j];
              next = rej.next;
              fun = rej.fun;
              if (!fun) {
                return;
              }
              try {
                rs = fun.call(void 0, _this.reason);
                next && resolveX(next, rs);
              } catch (_error) {
                e = _error;
                console.log("reject e");
                next.reject(e);
              }
            }
            return _this.rejected = true;
          } else {
            _this.onRejected.length = 0;
            results = [];
            for (k = 0, len1 = _onRejected.length; k < len1; k++) {
              rej = _onRejected[k];
              results.push(rej.next.reject(_this.reason));
            }
            return results;
          }
        };
      })(this), 0);
    };

    Promise.resolve = function(value) {
      var p;
      p = new Promise();
      p.resolve(value);
      return p;
    };

    Promise.reject = function(reason) {
      var p;
      p = new Promise();
      p.reject(reason);
      return p;
    };

    Promise.all = function(promises) {
      var done, finish, fn, i, j, len, p, promise, result;
      promise = new Promise();
      result = new Array(promise.length);
      finish = 0;
      done = false;
      fn = function(i) {
        return p.then(function(rs) {
          result[i] = rs;
          if (++finish === promises.length && !done) {
            return promise.resolve(result);
          }
        }, function(err) {
          done = true;
          return promise.reject(err);
        });
      };
      for (i = j = 0, len = promises.length; j < len; i = ++j) {
        p = promises[i];
        fn(i);
      }
      return promise;
    };

    return Promise;

  })();
});
