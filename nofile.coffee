# nofile-pre-require: coffee-script/register

kit = require 'nokit'
drives = kit.require 'drives'

module.exports = (task, option)->
    task 'build', "Build Project", (opts)->
        kit.warp 'light-promise.coffee'
        .load drives.reader()
        .load drives.auto 'lint', '.coffee': config: require './coffeelint-strict.json'
        .load drives.auto 'compile'
        .run 'dist'
        .catch (e)->
            if e.level and e.rule
                kit.Promise.resolve()
            else
                kit.Promise.reject e

    task 'default', ['build']
