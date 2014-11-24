###
    A Super Lightweight promise/A+ partially implementation
    @author: Draucpid
    @date: Nov. 23th, 2014
###
((root, factory)->
    if typeof module is "object" && typeof module.exports is "object"
        module.exports = factory root
    else if typeof define is 'function' and define.amd
        define 'light-promise', [], -> factory root
    else
    	root.light_promise = factory root
    	if not root.Promise then root.Promise = factory root
) this, (root)->
	class Promise
	    constructor: (resolver)->
	        @state = 'pending'
	        try
	        	resolver and resolver.call null, @resolve, @reject
	        catch err
	        	@.reject err
	        @
	    then: (@onFulfilled, @onRejected)->
	        @_next = new Promise()
	        switch @state
	            when 'fulfilled' then @_fireResolve()
	            when 'rejected' then @_fireReject()
	        @_next
	    catch: (onRejected)->
	        @['then'] null, onRejected
	    resolve: (@value)=>
	        @state = 'fulfilled'
	        @_fireResolve()
	        @
	    reject: (@reason)=>
	        @state = 'rejected'
	        @_fireReject()
	        @
	    _fireResolve: ()->
	        try
	            if @onFulfilled
	                rs = @onFulfilled.call null, @value
	                if @_next then resolveX @_next, rs
	            else @_next?.resolve @value
	        catch e
	            @_next?.reject e
	    _fireReject: ()->
	        try
	            if @onRejected
	                rs = @onRejected.call null, @reason
	                if @_next then resolveX @_next, rs
	            else @_next?.reject @reason
	        catch e
	            @_next?.reject e

	resolveX = (promise, x)->
	    if x instanceof Promise
	        switch x.state
	            when 'pending' then x.then promise.resolve, promise.reject
	            when 'fulfilled' then promise.resolve x.value
	            when 'rejected' then promise.reject x.reason
	    else
	        promise.resolve x
	    promise

	Promise.resolve = (value)->
	    p = new Promise()
	    p.resolve value
	    p
	Promise.reject = (reason)->
	    p = new Promise()
	    p.reject reason
	    p
	Promise.all = (promises)->
	    promise = new Promise()
	    result = new Array promise.length
	    finish = 0
	    done = false
	    for p, i in promises
	        p.then (rs)->
	            result[i] = rs
	            if ++finish is promises.length and not done
	                promise.resolve result
	        , (err)->
	            done = true
	            promise.reject err
	    promise
	
	Promise