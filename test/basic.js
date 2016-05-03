var assert = require("assert");
var Promise = require("../light-promise.es6")
describe('Promise', function() {
    describe('#constructor', function() {
        it('should return an object with method then and catch', function() {
            var promise = new Promise()
            assert.equal('object', typeof promise);
            assert.equal('function', typeof promise.then);
            assert.equal('function', typeof promise['catch']);
        });

        it('should be inited with a resolve with accept two function as params', function() {
            var promise = new Promise(function(resolve, reject) {
                assert.equal('function', typeof resolve);
                assert.equal('function', typeof reject);
            });
            assert.equal('object', typeof promise);
            assert.equal('function', typeof promise.then);
            assert.equal('function', typeof promise['catch']);
        })
    })
    describe('#then', function() {
        it('should print the value resolved', function(done) {
            var promise = new Promise(function(resolve, reject) {
                resolve(13578)
            });
            promise.then(function(rs) {
                assert.equal(rs, 13578)
                done()
            }, done);
        })
        it('should print the value rejected', function(done) {
            var promise = new Promise(function(resolve, reject) {
                reject("abc")
            })
            promise.then(done, function(err) {
                assert.equal(err, "abc");
                done()
            });
        });
        it("should reject the Error thrown as a Promise", function(done) {
            var promise = new Promise(function(resolve, reject) {
                    throw TypeError('hehe')
                })
            promise.then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
                done()
            }, function(err) {
                assert.equal(typeof err, 'object');
                done()
            })
        })
        it('should resolve the return value for handler', function(done) {
            var promise = new Promise(function(resolve, reject) {
                resolve(13578)
            });
            promise.then(function(rs) {
                assert.equal(rs, 13578)
                return 12345
            }, function(err) {
                assert.equal(typeof err, typeof undefined)
                done()
            }).then(function(rs){
                assert(rs, 12345)
                return Promise.reject('err')
            }, function(err){
                assert.equal(typeof err, typeof undefined)
                done()
            })['catch'](function(err){
                assert.equal(err, 'err')
                return 13579
            }).then(function(rs){
                assert.equal(rs, 13579)
                done()
            }, function(err){
                assert.equal(typeof err, typeof undefined)
                done()
            })
        })
        it('promise1 which resolves a promise2 should resolve the promise2 resolved value', function(done) {
            var promise1 = new Promise(function (resolve) {
                setTimeout(function() {
                    resolve(1)
                }, 500)
            })

            var promise2 = Promise.resolve(promise1);
            promise2.then(function (v) {
                assert.equal(v, 1)
                done()
            })
            .catch(function(err) {done(err)})
        })
    });
    describe('#Promise.resolve and Promise.reject', function() {
        it("should reolve the value as a Promise", function(done) {
            var obj = {
                    ad: 213
                },
                promise = new Promise(function(resolve, reject) {
                    resolve(obj)
                })
            promise.then(function(rs) {
                assert.equal(rs, obj);
                return Promise.resolve(rs)
            }, function(err) {
                assert.equal(typeof err, typeof undefined)
                done()
            }).then(function(rs) {
                assert.equal(rs, obj);
                done()
            }, function(err) {
                assert.equal(typeof err, typeof undefined);
                done()
            })
        })
        it("should reject the value as a Promise", function(done) {
            var arr = [1, 3, 4, 5, 7],
                promise = new Promise(function(resolve, reject) {
                    resolve(arr);
                })

            promise.then(function(rs) {
                assert.equal(rs, arr);
                return Promise.reject(rs);
            }, function(err) {
                assert.equal(typeof err, typeof undefined);
                done()
            }).then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
                done()
            }, function(err) {
                assert.equal(arr, err)
                done()
            })
        })
    });
    describe("#catch", function(){
        it("should catch the rejected reason", function(done){
            var promise = new Promise(function(resolve, reject) {
                reject("abc")
            })
            promise.then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
                done()
            })['catch'](function(err){
                assert.equal(err, "abc")
                done()
            })
        })
        it("should catch the thrown error", function(done){
            var promise = new Promise(function(resolve, reject) {
                throw TypeError("abc")
            })
            promise.then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
                done()
            })['catch'](function(err){
                assert.equal(typeof err, 'object')
                done()
            })
        })
        it("should catch after a long way passed", function(done){
            var promise = new Promise(function(resolve, reject) {
                throw TypeError("abc")
            })
            promise.then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
            }).then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
            }).then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
            }).then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
            }).then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
            }).then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
            }).then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
            }).then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
            }).then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
            }).then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
            }).then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
            })['catch'](function(err){
                assert.equal(typeof err, 'object')
                done()
            })
        })
        it("should not catch after reject reason has been handled", function(done){
            var promise = new Promise(function(resolve, reject) {
                throw TypeError("abc")
            })
            promise.then(function(rs) {
                assert.equal(typeof rs, typeof undefined);
                done()
            }, function(err){
                assert.equal(typeof err, 'object')
                done()
            })['catch'](function(err){
                assert.equal(typeof err, typeof undefined)
                done()
            })
        })

    })
    describe('#Promise.all', function() {
        it('should resolve an array after all promises are resolved', function(done) {
            var arr = [1, 2, 3],
                promise1 = new Promise(function(re, rj){
                    re(arr[0])
                }),
                promise2 = new Promise(function(re, rj){
                    re(arr[1])
                }),
                promise3 = new Promise(function(re, rj){
                    re(arr[2])
                })
            Promise.all([promise1, promise2, promise3])
            .then(function(rs){
                assert.ok(Array.isArray(rs))
                assert.equal(rs[0], arr[0]);
                assert.equal(rs[1], arr[1]);
                assert.equal(rs[2], arr[2]);
                done()
            })
        });

        it('should reject the array if one of the promises is rejected', function(done) {
            var arr = [1, 2, 3],
                promise1 = new Promise(function(re, rj){
                    re(arr[0])
                }),
                promise2 = new Promise(function(re, rj){
                    rj(arr[1])
                }),
                promise3 = new Promise(function(re, rj){
                    re(arr[2])
                })
            Promise.all([promise1, promise2, promise3])
            .then(function(rs){
                assert.equal(typeof rs, typeof undefined)
                done()
            }, function(err){
                assert.equal(err, arr[1])
                done()
            })
        });

        it('should resolve [] when input is empty or []', function(done) {
            Promise.all([])
            .then(function(rs){
                assert.ok(Array.isArray(rs))
                assert.deepEqual(rs, []);
                done()
            })
        });
    })

    describe('#Promise.race', function() {
        it('should resolve when one of the promises is resolved', function(done) {
            var arr = [1, 2, 3],
                promise1 = new Promise(function(re, rj){
                    setTimeout(function() {
                        re(arr[0])
                    }, 100)

                }),
                promise2 = new Promise(function(re, rj){
                    setTimeout(function() {
                        re(arr[1])
                    }, 400)
                }),
                promise3 = new Promise(function(re, rj){
                    setTimeout(function() {
                        re(arr[2])
                    }, 800)
                })
            Promise.all([promise1, promise2, promise3])
            .then(function(rs){
                assert.deepEqual(rs, arr);
                done()
            }).catch(done)
        });

        it('should reject when one of the promises is rejected', function(done) {
            var arr = [1, 2, 3],
                promise1 = new Promise(function(re, rj){
                    setTimeout(function() {
                        re(arr[0])
                    }, 400)
                }),
                promise2 = new Promise(function(re, rj){
                    setTimeout(function() {
                        rj(arr[1])
                    }, 100)
                }),
                promise3 = new Promise(function(re, rj){
                    setTimeout(function() {
                        re(arr[2])
                    }, 800)
                })
            Promise.all([promise1, promise2, promise3])
            .then(function(rs){
                assert.equal(typeof rs, typeof undefined)
                done()
            }, function(err){
                assert.equal(err, arr[1])
                done()
            })
        });
    })

    describe('Asny example', function() {
        it('should be resolved after 1.5 seconds', function(done) {
            var promise = new Promise(function(re, rj){
                    setTimeout(function(){
                        re('good')
                    }, 500)
                })
            promise.then(function(rs){
                assert.equal(rs, 'good')
                done()
            })['catch'](function(err){
                assert.equal(typeof err, typeof undefined)
                done()
            })
        });
        it('should be rejected after 1.5 seconds', function(done) {
            var promise = new Promise(function(re, rj){
                    setTimeout(function(){
                        rj('bad')
                    }, 500)
                })
            promise.then(function(rs){
                assert.equal(typeof rs, typeof undefined)
                done()
            })['catch'](function(err){
                assert.equal(err, 'bad')
                done()
            })
        });


    })
});
