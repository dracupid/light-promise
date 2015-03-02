###
    A Super Lightweight promise/A+ implementation
    @author: Draucpid
###
isFun = (a) -> a and a.constructor.name is "Function"
if process?.nextTick then setTimeout = process.nextTick

((root, factory) ->
    if typeof module is "object" && typeof module.exports is "object"
        module.exports = factory root
    else if typeof define is 'function' and define.amd
        define 'light-promise', [], -> factory root
    else
        root.Promise ?= factory root
) this, (root) ->
    resolveX = (promise, x) ->
        if promise is x
            promise.reject new TypeError()
        else if x instanceof Promise
            switch x.state
                when 'pending' then x.then promise.resolve, promise.reject
                when 'fulfilled' then promise.resolve x.value
                when 'rejected' then promise.reject x.reason
        else
            promise.resolve x
        promise

    class Promise
        constructor: (resolver) ->
            @state = 'pending'
            @onFulfilled = []
            @onRejected = []
            @onFulfilled.num = @onRejected.num = 0
            @resolved = @rejected = no
            setTimeout =>
                try
                    resolver and resolver.call null, @resolve, @reject
                catch err
                    @reject err
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
                when 'fulfilled' then @_fireResolve()
                when 'rejected' then @_fireReject()
            next
        catch: (onRejected) ->
            @then null, onRejected
        resolve: (@value)=>
            if @state is 'fulfilled' then return @
            @state = 'fulfilled'
            @_fireResolve()
            @
        reject: (@reason) =>
            if @state is 'rejected' then return @
            @state = 'rejected'
            @_fireReject()
            @
        _fireResolve: =>
            setTimeout =>
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
        _fireReject: =>
            setTimeout =>
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
                            console.log "reject e"
                            next.reject e
                    @rejected = yes
                else
                    @onRejected.length = 0
                    for rej in _onRejected
                        rej.next.reject @reason
            , 0

        @resolve: (value) ->
            p = new Promise()
            p.resolve value
            p
        @reject: (reason) ->
            p = new Promise()
            p.reject reason
            p
        @all: (promises) ->
            promise = new Promise()
            result = new Array promise.length
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
