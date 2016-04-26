require('coffee-script/register');
Promise = require('../light-promise');

Promise.resolved = Promise.resolve
Promise.rejected = Promise.reject
Promise.deferred = function(){
    promise = new Promise()
    return {
        promise: promise,
        resolve: function(value){
            promise.resolve(value)
        },
        reject: function(reason){
            promise.reject(reason)
        }
    }
}

var promisesAplusTests = require("promises-aplus-tests");
promisesAplusTests(Promise, {grep: "`y` is an already-fulfilled promise for a synchronously-"}, function (err) {});
//2.3.3 not passed

