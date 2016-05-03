###
    A Super Lightweight promise/A+ implementation
    @author: Draucpid
###
"use strict"

isFun = (a) -> typeof a is 'function'
isObj = (a) -> a and typeof a is 'object'

$nextTick = if process?.nextTick then process.nextTick else setTimeout

# redStart = '\u001b[31m'
# redEnd = '\u001b[39m'

# unCaughtError = (promise) ->
#     $nextTick ->
#         if promise.state is STATE.REJECTED and not promise.onRejected.length
#             reason = promise.reason.stack or promise.reason
#             console.error redStart, "Possibly unhandled error: ", reason, redEnd
#             throw promise.reason
#     , 0

STATE =
    PENDING: 0
    FULFILLED: 2
    REJECTED: 4

((root, factory) ->
    if typeof module is "object" && typeof module.exports is "object"
        module.exports = factory root
    else if typeof define is 'function' and define.amd
        define 'light-promise', [], -> factory root
    else
        root.Promise ?= factory root
) @, (root) ->
    # 2.3 The Promise Resolution Procedure
    resolveX = (promise, x) ->
        # 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason
        if promise is x
            promise._fireReject new TypeError()
        # 2.3.2 If x is a promise, adopt its state:
        else if x instanceof Promise
            switch x.state
                # 2.3.2.1 If x is pending, promise must remain pending until x is fulfilled or rejected.
                when STATE.PENDING then x.then promise.resolve, promise.reject
                # 2.3.2.2 If/when x is fulfilled, fulfill promise with the same value.
                when STATE.FULFILLED then promise._fireResolve x.value
                # 2.3.2.3 If/when x is rejected, reject promise with the same reason.
                when STATE.REJECTED then promise._fireReject x.reason
        # 2.3.3 Otherwise, if x is an object or function,
        else if isObj(x) or isFun(x)
            # 2.3.3.1 Let then be x.then.
            try xThen = x.then
            # 2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
            catch e
                return promise._fireReject e

            # 2.3.3.3 If then is a function, call it with x as this, first argument resolvePromise,
            # and second argument rejectPromise, where:
            if isFun xThen
                # 2.3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
                # 2.3.3.3.2 If/when rejectPromise is called with a reason r, reject promise with r.
                # 2.3.3.3.3 If both resolvePromise and rejectPromise are called,
                #           or multiple calls to the same argument are made,
                #           the first call takes precedence, and any further calls are ignored.
                called = no
                resolvePromise = (y) ->
                    if called then return
                    called = yes
                    resolveX promise, y
                rejectPromise = (r) ->
                    if called then return
                    called = yes
                    promise._fireReject r

                try xThen.call x, resolvePromise, rejectPromise
                # 2.3.3.3.4 If calling then throws an exception e,
                catch e
                    # 2.3.3.3.4.1 If resolvePromise or rejectPromise have been called, ignore it.
                    if called then return
                    # 2.3.3.3.4.2 Otherwise, reject promise with e as the reason.
                    else promise._fireReject e

            # 2.3.3.4 If then is not a function, fulfill promise with x.
            else
                promise._fireResolve x
        # 2.3.4 If x is not an object or function, fulfill promise with x.
        else
            promise._fireResolve x

    class Promise
        constructor: (resolver) ->
            @state = STATE.PENDING
            @onFulfilled = []
            @onRejected = []
            @onFulfilled.num = @onRejected.num = 0
            $nextTick =>
                try
                    # unCaughtError @
                    resolver and resolver.call null, @resolve, @reject
                catch e
                    @reject e
            , 0
            @

        then: (onFulfilled, onRejected) ->
            next = new Promise()

            if isFun(onFulfilled)
                @onFulfilled.num += 1
                @onFulfilled.push fun: onFulfilled, next: next
            else
                @onFulfilled.push fun: null, next: next

            if isFun(onRejected)
                @onRejected.num += 1
                @onRejected.push fun: onRejected, next: next
            else
                @onRejected.push fun: null, next: next

            switch @state
                when STATE.FULFILLED then @_fireResolve @value
                when STATE.REJECTED then @_fireReject @reason
            next
        catch: (onRejected) ->
            @then null, onRejected

        resolve: (value) =>
            if @state is STATE.FULFILLED then return @
            resolveX @, value
            @

        reject: (reason) =>
            if @state is STATE.REJECTED then return @
            @_fireReject reason
            @

        _fireResolve: (@value) =>
            @state = STATE.FULFILLED
            $nextTick =>
                next = null
                _onFullfilled = [].concat @onFulfilled
                if @onFulfilled.num
                    @onFulfilled.length = 0
                    @onFulfilled.num = 0
                    for ful in _onFullfilled
                        next = ful.next
                        fun = ful.fun
                        if not fun then return
                        try
                            rs = fun.call undefined, @value
                            next and resolveX next, rs
                        catch e
                            next.reject e
                    @fulfilled = yes
                else
                    @onFulfilled.length = 0
                    for ful in _onFullfilled
                        ful.next.resolve @value
            , 0
        _fireReject: (@reason) =>
            @state = STATE.REJECTED
            $nextTick =>
                next = null
                _onRejected = [].concat @onRejected
                if @onRejected.num
                    @onRejected.length = 0
                    @onRejected.num = 0
                    for rej in _onRejected
                        next = rej.next
                        fun = rej.fun
                        if not fun then return
                        try
                            rs = fun.call undefined, @reason
                            next and resolveX next, rs
                        catch e
                            next.reject e
                else
                    @onRejected.length = 0
                    for rej in _onRejected
                        rej.next.reject @reason
            , 0

        @resolve: (value) ->
            new Promise().resolve(value)
        @reject: (reason) ->
            new Promise().reject(reason)
        @all: (promises) ->
            if not promises or promises.length is 0
                return Promise.resolve []

            promise = new Promise()
            result = new Array promises.length
            finish = 0
            done = false
            for p, i in promises
                do (i) ->
                    p.then (rs) ->
                        result[i] = rs
                        if ++finish is promises.length and not done
                            promise.resolve result
                    , (err) ->
                        done = true
                        promise.reject err
            promise
