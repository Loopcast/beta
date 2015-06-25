save = require './save'

module.exports = ( room_id, data, callback ) ->

  # response = pusher.trigger room_subscribe_id, "message", data
  sockets.send room_id, data

  # save message to redis
  save room_id, data, ( error, response ) ->

    if error
      console.error error

    if callback
      callback error, response