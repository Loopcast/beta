global.s  = require './settings'

# function shortcuts
global.lib = ( path ) -> 
  require __dirname + "/lib/#{path}"

global.models = ( path ) -> 
  require __dirname + "/models/#{path}"

# everyone users

global.joi = require 'joi'

global.happens = require 'happens'

# path shortcuts

path  = require 'path'

global.pack = require '../package'

global.root = path.join( __dirname + "/.."  )

global.www = ( path ) -> __dirname + "/../www/#{path}"

# widely used functions

# data -> object containing extra info about the error
# set reply to null if no reply needed
# set skip_report to true if no need to report to newrelic
global.failed = ( request, reply, error, data, skip_report ) ->
  
  if typeof( error ) is 'string' then error = new Error error

  if not error?
    console.error "Couldnt reply and report error"
    console.error "error is null or not defined"
    return

  data = data || {}

  # send error down the pipe to the user
  if typeof reply == 'function'
    reply 
      success: false
      error  : 
        message: error.message

  # no need to do extra work when running test
  if s.in_tests then return
  
  # TODO:
  # - grab user id in case user is logged?
  # - grab request payload if request method is POST
  # - integrate with newrelic insights API ?
  
  # return early if specified by the caller
  if skip_report then return

  # report to newrelic
  if newrelic?
    newrelic.noticeError error, data


module.exports = global