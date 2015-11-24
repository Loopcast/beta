escape = require 'escape-html'
save   = require './save'

module.exports = ( tape_id, data, callback ) ->

  data.message = escape data.message

  # response = pusher.trigger room_subscribe_id, "message", data
  sockets.send tape_id, data

  # save message to redis
  save tape_id, data, ( error, response ) ->

    if error
      console.error error

    if callback
      callback error, response