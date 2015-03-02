kit = require 'nokit'
drives = kit.require 'drives'

module.exports = (task) ->
    task 'build', ->
        kit.warp 'light-promise.coffee'
        .load drives.coffeelint config: "coffeelint-strict.json"
        .load drives.coffee()
        .run 'dist'
        .catch -> return
