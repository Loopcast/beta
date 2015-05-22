global.s  = require './settings'

# function shortcuts
global.lib = ( path ) -> 
  require __dirname + "/lib/#{path}"

global.models = ( path ) -> 
  require __dirname + "/models/#{path}"

global.find = ( path ) -> 
  require __dirname + "/models/find/#{path}"

global.schema = ( path ) -> 
  require __dirname + "/models/schemas/#{path}"

global.slugify = (str) ->
  return str.split( " " ).join( "-" )

# everyone uses

moment = require 'moment'

global.joi = require 'joi'

global.Boom = require 'boom'

global.happens = require 'happens'

global.aware   = require 'aware'

global.request = require 'request'

global.now = ( value ) -> moment.utc(value)

global.User = schema 'user'

global.Room = schema 'room'

global.Like = schema 'like'

r = require 'redis'

# connect to redis
# TODO: improve this, listen for callback on connection
client      = r.createClient s.redis.port, s.redis.host
client.auth s.redis.password

global.redis = client

# path shortcuts

path  = require 'path'

global.pack = require '../package'

global.root = path.join( __dirname + "/.."  )

global.www = ( path ) -> __dirname + "/../www/#{path}"

# widely used functions

Intercom = require "intercom.io"

global.intercom = new Intercom 
  apiKey: s.intercom.key
  appId : s.intercom.id

Pusher = require 'pusher'

global.pusher = new Pusher
  appId : s.pusher.appId
  key   : s.pusher.key
  secret: s.pusher.secret

cloudinary = require 'cloudinary'
cloudinary.config s.cloudinary

global.cloudinary = cloudinary

# data -> object containing extra info about the error
# set reply to null if no reply needed
# set skip_report to true if no need to report to newrelic
global.failed = ( request, reply, error, data, skip_report ) ->
  
  # if typeof( error ) is 'string' then error = new Error error

  if not error?
    console.error "Couldnt reply and report error"
    console.error "error is null or not defined"
    return

  data = data || {}

  # send error down the pipe to the user
  if typeof reply == 'function'

    console.log "replying error ->", error
    reply error : error

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