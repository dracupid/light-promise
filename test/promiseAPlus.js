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
promisesAplusTests(Promise, {grep: /(2.(1|2).\d)|(2.3.[124])/}, function (err) {});
//2.3.3 not passed

