'use strict'
/**
 * A Super Lightweight promise/A+ implementation
 * @author: Draucpid
 */

let isFun = a => typeof a === 'function'
let isObj = a => a && typeof a === 'object'

let $nextTick = typeof process === 'object' ? process.nextTick : setTimeout

const STATE = {
  PENDING: 0,
  FULFILLED: 2,
  REJECTED: 4
}

let ensureCallOn = function (tobe, msg) {
  if (this !== tobe) {
    throw new TypeError(msg)
  }
}

let ensureCallAs = function (superclass, msg) {
  if (this.constructor !== superclass) {
    throw new TypeError(msg)
  }
};

(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(root)
  } else if (typeof define === 'function' && define.amd) {
    define('light-promise', [], () => factory(root))
  } else {
    root.Promise == null && (root.Promise = factory(root))
  }
})(this, function (root) {
  // 2.3 The Promise Resolution Procedure
  let resolveX = function (promise, x) {
    // 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason
    if (promise === x) {
      promise._fireReject(new TypeError())
      // 2.3.2 If x is a promise, adopt its state:
    } else if (x instanceof Promise) {
      switch (x.state) {
        // 2.3.2.1 If x is pending, promise must remain pending until x is fulfilled or rejected.
        case STATE.PENDING:
          x.then(promise.resolve, promise.reject)
          break
        // 2.3.2.2 If/when x is fulfilled, fulfill promise with the same value.
        case STATE.FULFILLED:
          promise._fireResolve(x.value)
          break
        // 2.3.2.3 If/when x is rejected, reject promise with the same reason.
        case STATE.REJECTED:
          promise._fireReject(x.reason)
          break
      }
      // 2.3.3 Otherwise, if x is an object or function,
    } else if (isObj(x) || isFun(x)) {
      // 2.3.3.1 Let then be x.then.
      try {
        var xThen = x.then
      } catch (e) {
        // 2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
        promise._fireReject(e)
        return
      }

      // 2.3.3.3 If then is a function, call it with x as this, first argument resolvePromise,
      // and second argument rejectPromise, where:
      if (isFun(xThen)) {
        // 2.3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
        // 2.3.3.3.2 If/when rejectPromise is called with a reason r, reject promise with r.
        // 2.3.3.3.3 If both resolvePromise and rejectPromise are called,
        //           or multiple calls to the same argument are made,
        //           the first call takes precedence, and any further calls are ignored.
        let called = false
        let resolvePromise = function (y) {
          if (!called) {
            called = true
            resolveX(promise, y)
          }
        }
        let rejectPromise = function (r) {
          if (!called) {
            called = true
            promise._fireReject(r)
          }
        }

        try {
          return xThen.call(x, resolvePromise, rejectPromise)
        } catch (e) { // 2.3.3.3.4 If calling then throws an exception e,
          // 2.3.3.3.4.1 If resolvePromise or rejectPromise have been called, ignore it.
          // 2.3.3.3.4.2 Otherwise, reject promise with e as the reason.
          if (!called) {
            promise._fireReject(e)
          }
        }
      } else {
        // 2.3.3.4 If then is not a function, fulfill promise with x.
        promise._fireResolve(x)
      }
    } else {
      // 2.3.4 If x is not an object or function, fulfill promise with x.
      promise._fireResolve(x)
    }
  }

  class Promise {
    constructor (executor) {
      if (executor && !isFun(executor)) {
        throw new TypeError('executor must be a function')
      }

      if (this.state != null) {
        throw new TypeError('promise create error')
      }

      this.state = STATE.PENDING
      this.onFulfilled = []
      this.onRejected = []
      this.onFulfilled.num = this.onRejected.num = 0
      this.resolve = this.resolve.bind(this)
      this.reject = this.reject.bind(this)

      try {
        executor && executor(this.resolve, this.reject)
      } catch (e) {
        this.reject(e)
      }
      return this
    }

    then (onFulfilled, onRejected) {
      ensureCallAs.call(this, Promise, 'then should be called on a promise object')
      let next = new Promise()

      $nextTick(() => {
        if (isFun(onFulfilled)) {
          this.onFulfilled.num += 1
          this.onFulfilled.push({fun: onFulfilled, next})
        } else {
          this.onFulfilled.push({fun: null, next})
        }

        if (isFun(onRejected)) {
          this.onRejected.num += 1
          this.onRejected.push({fun: onRejected, next})
        } else {
          this.onRejected.push({fun: null, next})
        }

        switch (this.state) {
          case STATE.FULFILLED:
            this._fireResolve(this.value)
            break
          case STATE.REJECTED:
            this._fireReject(this.reason)
            break
        }
      })
      return next
    }

    catch (onRejected) {
      return this.then(null, onRejected)
    }

    resolve (value) {
      if (this.state !== STATE.FULFILLED) { resolveX(this, value) }
      return this
    }

    reject (reason) {
      if (this.state !== STATE.REJECTED) { this._fireReject(reason) }
      return this
    }

    _fireResolve (value) {
      this.value = value
      this.state = STATE.FULFILLED
      $nextTick(() => {
        let _onFulfilled = [].concat(this.onFulfilled)
        if (this.onFulfilled.num) {
          this.onFulfilled.length = 0
          this.onFulfilled.num = 0
          for (let i = 0; i < _onFulfilled.length; i++) {
            let ful = _onFulfilled[i]
            let {fun, next} = ful
            if (!fun) { return }
            try {
              let rs = fun(this.value)
              next && resolveX(next, rs)
            } catch (e) {
              next.reject(e)
            }
          }
        } else {
          this.onFulfilled.length = 0
          for (let j = 0; j < _onFulfilled.length; j++) {
            var ful = _onFulfilled[j]
            ful.next.resolve(this.value)
          }
        }
      })
    }

    _fireReject (reason) {
      this.reason = reason
      this.state = STATE.REJECTED
      $nextTick(() => {
        let _onRejected = [].concat(this.onRejected)
        if (this.onRejected.num) {
          this.onRejected.length = 0
          this.onRejected.num = 0
          for (let i = 0; i < _onRejected.length; i++) {
            let rej = _onRejected[i]
            let {fun, next} = rej
            if (!fun) { return }
            try {
              let rs = fun(this.reason)
              next && resolveX(next, rs)
            } catch (e) {
              next.reject(e)
            }
          }
        } else {
          this.onRejected.length = 0
          for (let j = 0; j < _onRejected.length; j++) {
            var rej = _onRejected[j]
            rej.next.reject(this.reason)
          }
        }
      }, 0)
    }

    static resolve (value) {
      ensureCallOn.call(this, Promise, 'Promise.resolve should be called on Promise')
      if (value instanceof Promise && value.constructor === this) {
        return value
      }
      return new Promise().resolve(value)
    }

    static reject (reason) {
      ensureCallOn.call(this, Promise, 'Promise.reject should be called on Promise')
      return new Promise().reject(reason)
    }

    static all (promises) {
      ensureCallOn.call(this, Promise, 'Promise.all should be called on Promise')
      if (!Array.isArray(promises)) {
        return Promise.reject(new TypeError('Promise.all only receive an array'))
      }
      if (promises.length === 0) {
        return Promise.resolve([])
      }

      return new Promise(function (resolve, reject) {
        let result = new Array(promises.length)
        let finish = 0
        let done = false
        for (let i = 0; i < promises.length; i++) {
          let cur = promises[i];
          (i =>
            cur.then(rs => {
              if (!done) {
                result[i] = rs
                if (++finish === promises.length) {
                  done = true
                  resolve(result)
                }
              }
            }, err => {
              if (!done) {
                done = true
                reject(err)
              }
            }))(i)
        }
      })
    }

    static race (promises) {
      ensureCallOn.call(this, Promise, 'Promise.race should be called on Promise')
      if (!Array.isArray(promises)) {
        return Promise.reject(new TypeError('Promise.race only receive an array'))
      }
      return new Promise(function (resolve, reject) {
        let done = false
        for (let i = 0; i < promises.length; i++) {
          let cur = promises[i]
          switch (cur.state) {
            case STATE.FULFILLED:
              return resolve(cur.value)
            case STATE.REJECTED:
              return reject(cur.reason)
          }
          cur.then((rs) => {
            if (!done) {
              done = true
              resolve(rs)
            }
          }, (err) => {
            if (!done) {
              done = true
              reject(err)
            }
          })
        }
      })
    }
  }
  return Promise
})
