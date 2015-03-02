kit = require 'nokit'
drives = kit.require 'drives'

kit.warp 'light-promise.coffee'
.load drives.reader isCache: false
.load drives.coffeelint config: "coffeelint-strict.json"
.load drives.coffee()
.run 'dist'
.catch -> return
