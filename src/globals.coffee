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

global.User   = schema 'user'

global.Room   = schema 'room'

global.Tape   = schema 'tape'

global.Stream = schema 'stream'

global.Like   = schema 'like'

r = require 'redis'

# connect to redis
# TODO: improve this, listen for callback on connection
client = r.createClient s.redis.port, s.redis.host
client.auth s.redis.password
  

global.redis = client


global.mandrill = require('node-mandrill')( s.mandrill.api.key );

# path shortcuts

path  = require 'path'

global.pack = require '../package'

global.root = path.join( __dirname + "/.."  )

global.www = ( path ) -> __dirname + "/../public/#{path}"

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


S3 = require 's3'

global.s3 = S3.createClient
  maxAsyncS3   : 20
  s3RetryCount : 5
  s3RetryDelay : 200
  s3Options:
    accessKeyId    : s.s3.key
    secretAccessKey: s.s3.secret

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

  console.log "-failed"
  console.log error


# Application Globals

global.server  = require './server'

global.sockets = require './sockets'


module.exports = global